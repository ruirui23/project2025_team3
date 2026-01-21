// database/index_db.js
import Dexie from "dexie";

/**
 * IndexedDB wrapper (Dexie)
 *
 * Schema intent:
 * - users: login identity (email/user_name) + password hash (recommended)
 * - status: 1 row per user (user_id unique)
 * - diaries: unique per (user_id, diary_id)
 */
export class IndexDB {
  /**
   * @param {string} db_name
   */
  constructor(db_name) {
    this.db = new Dexie(db_name);

    // NOTE:
    // - users.email / users.user_name should be unique in most apps.
    //   If you want uniqueness, change to "&email, &user_name".
    // - status uses &user_id so one status per user.
    // - diaries uses &[user_id+diary_id] so unique per pair.
    this.db.version(1).stores({
      users: "++id, email, user_name, user_pass",
      status: "++id, &user_id, level, rank, parameter",
      diaries: "++id, &[user_id+diary_id], user_id, diary_id, entries",
    });

    this.users = this.db.table("users");
    this.status = this.db.table("status");
    this.diaries = this.db.table("diaries");
  }

  /** Open DB explicitly if you want (Dexie auto-opens on first use) */
  async open() {
    await this.db.open();
    return true;
  }

  /** Close DB */
  close() {
    this.db.close();
  }

  /* =========================
   * Users: create + login
   * ========================= */

  /**
   * Create user.
   * - Returns { ok, id, reason }
   * - Also creates initial status row (if not exists).
   *
   * @param {object} args
   * @param {string} [args.email]
   * @param {string} args.user_name
   * @param {string} args.user_pass  // store hash recommended
   */
  async createUser({ email = "", user_name, user_pass }) {
    if (!user_name || !user_pass) {
      return { ok: false, id: null, reason: "invalid_args" };
    }

    // Check duplicates (since schema doesn't enforce unique here)
    const existing = await this.users
      .where("user_name")
      .equals(user_name)
      .first();

    if (existing) return { ok: false, id: existing.id, reason: "user_name_exists" };

    // If you use email and want it unique:
    if (email) {
      const existingEmail = await this.users.where("email").equals(email).first();
      if (existingEmail) return { ok: false, id: existingEmail.id, reason: "email_exists" };
    }

    const user_id = await this.users.add({
      email,
      user_name,
      user_pass,
    });

    // Create initial status row (1 per user)
    await this._ensureStatusRow(user_id);

    return { ok: true, id: user_id, reason: null };
  }

  /**
   * Login by user_name or email.
   * Returns { ok, id, reason }
   *
   * @param {object} args
   * @param {string} args.identifier  // user_name or email
   * @param {string} args.user_pass
   */
  async login({ identifier, user_pass }) {
    if (!identifier || !user_pass) {
      return { ok: false, id: null, reason: "invalid_args" };
    }

    // Try by user_name first, then email
    const byName = await this.users.where("user_name").equals(identifier).first();
    const user = byName ?? (await this.users.where("email").equals(identifier).first());

    if (!user) return { ok: false, id: null, reason: "not_found" };
    if (user.user_pass !== user_pass) return { ok: false, id: null, reason: "invalid_password" };

    // Ensure status exists for this user
    await this._ensureStatusRow(user.id);

    return { ok: true, id: user.id, reason: null };
  }

  /**
   * Get user by id (safe fields only if needed)
   * @param {number} user_id
   */
  async getUser(user_id) {
    const user = await this.users.get(user_id);
    return user ?? null;
  }

  /* =========================
   * Status: get + update (by user_id)
   * ========================= */

  /**
   * Ensure status row exists for a user (internal).
   * @param {number} user_id
   */
  async _ensureStatusRow(user_id) {
    const existing = await this.status.where("user_id").equals(user_id).first();
    if (existing) return existing;

    // Because status has "++id" + "&user_id", we must add with user_id.
    // level/rank/parameter are app-defined.
    const id = await this.status.add({
      user_id,
      level: 1,
      rank: 0,
      parameter: {
        "health": 100,
        "happiness": 50,
        "mentalState": 50,
        "hunger": 0,
      },
    });
    return await this.status.get(id);
  }

  /**
   * Get status by user_id
   * @param {number} user_id
   */
  async getStatus(user_id) {
    const row = await this.status.where("user_id").equals(user_id).first();
    if (!row) return null;
    return row;
  }

  /**
   * Update status by user_id (partial patch).
   * - patch can include: level, rank, parameter
   *
   * @param {number} user_id
   * @param {object} patch
   */
  async updateStatus(user_id, patch) {
    const row = await this.status.where("user_id").equals(user_id).first();
    if (!row) {
      // auto-create then update
      await this._ensureStatusRow(user_id);
      return this.updateStatus(user_id, patch);
    }

    await this.status.update(row.id, {
      ...patch,
    });

    return await this.status.get(row.id);
  }

  /**
   * Convenience: merge parameter object
   * @param {number} user_id
   * @param {object} partialParams
   */
  async mergeStatusParameter(user_id, partialParams) {
    const row = await this.getStatus(user_id);
    if (!row) {
      await this._ensureStatusRow(user_id);
      return this.mergeStatusParameter(user_id, partialParams);
    }

    const next = { ...(row.parameter ?? {}), ...(partialParams ?? {}) };
    return await this.updateStatus(user_id, { parameter: next });
  }

  /* =========================
   * Diaries: get + update (by user_id + diary_id)
   * ========================= */

  /**
   * Get diary row by (user_id, diary_id)
   * @param {number} user_id
   * @param {string|number} diary_id
   */
  async getDiary(user_id, diary_id) {
    const row = await this.diaries
      .where("[user_id+diary_id]")
      .equals([user_id, diary_id])
      .first();

    return row ?? null;
  }

  /**
   * Upsert diary by (user_id, diary_id)
   * - entries: any JSON-like (array/object/string) you use in app
   *
   * @param {number} user_id
   * @param {string|number} diary_id
   * @param {any} entries
   */
  async upsertDiary(user_id, diary_id, entries) {
    const existing = await this.getDiary(user_id, diary_id);
    if (existing) {
      await this.diaries.update(existing.id, { entries });
      return await this.diaries.get(existing.id);
    }

    const id = await this.diaries.add({
      user_id,
      diary_id,
      entries,
    });
    return await this.diaries.get(id);
  }

  /**
   * Patch diary entries (functional update)
   * updater receives current entries and returns next entries
   *
   * @param {number} user_id
   * @param {string|number} diary_id
   * @param {(current:any)=>any} updater
   */
  async updateDiaryEntries(user_id, diary_id, updater) {
    const existing = await this.getDiary(user_id, diary_id);
    const current = existing?.entries ?? null;
    const next = updater(current);

    return await this.upsertDiary(user_id, diary_id, next);
  }

  /**
   * List diaries for a user (optional utility)
   * @param {number} user_id
   */
  async listDiaries(user_id) {
    return await this.diaries.where("user_id").equals(user_id).toArray();
  }

  /**
   * Delete diary by (user_id, diary_id)
   * @param {number} user_id
   * @param {string|number} diary_id
   */
  async deleteDiary(user_id, diary_id) {
    const existing = await this.getDiary(user_id, diary_id);
    if (!existing) return { ok: false, reason: "not_found" };
    await this.diaries.delete(existing.id);
    return { ok: true, reason: null };
  }
}

export const indexDB = new IndexDB("app_database");