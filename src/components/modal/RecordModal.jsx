import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../common/Modal";
import "./RecordModal.css";

/**
 * 記録入力モーダル（LoginModal と同じ使い方 / 形に寄せた版）
 *
 * props:
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: (payload) => Promise<void> | void
 * - statConfigs: [{ key, label }, ...]
 * - defaultParams: { [key]: number }  // 新規時に使う初期値
 * - editData: { id, episode, date, time, parameters, timestamp, aiComment } | null
 */
export default function RecordModal({
  open,
  onClose,
  onSubmit,
  statConfigs = [],
  defaultParams = {},
  editData = null,
}) {
  const episodeRef = useRef(null);

  const isEdit = !!editData;

  const [episode, setEpisode] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [params, setParams] = useState({});
  const [error, setError] = useState("");

  const submittingRef = useRef(false);

  // open したときだけ初期値を詰める（LoginModalの挙動に合わせる）
  useEffect(() => {
    if (!open) return;

    const now = new Date();
    const pad2 = (n) => String(n).padStart(2, "0");
    const ymd = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(
      now.getDate()
    )}`;
    const hm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    if (isEdit) {
      setEpisode(editData?.episode ?? "");
      setDate(editData?.date ?? ymd);
      setTime(editData?.time ?? hm);

      const p = {};
      for (const c of statConfigs) p[c.key] = Number(editData?.parameters?.[c.key] ?? 0);
      setParams(p);
    } else {
      setEpisode("");
      setDate(ymd);
      setTime(hm);

      const p = {};
      for (const c of statConfigs) p[c.key] = Number(defaultParams?.[c.key] ?? 0);
      setParams(p);
    }

    setError("");
    submittingRef.current = false;
  }, [open, isEdit, editData, statConfigs, defaultParams]);

  const mismatchDate = useMemo(() => {
    // 任意：最低限の形式チェック（空は上で弾く）
    // "YYYY/MM/DD"
    if (!date) return false;
    return !/^\d{4}\/\d{2}\/\d{2}$/.test(date.trim());
  }, [date]);

  const mismatchTime = useMemo(() => {
    // "HH:mm"
    if (!time) return false;
    return !/^\d{2}:\d{2}$/.test(time.trim());
  }, [time]);

  const canSubmit = useMemo(() => {
    if (!episode.trim()) return false;
    if (!date.trim() || !time.trim()) return false;
    if (mismatchDate || mismatchTime) return false;
    return true;
  }, [episode, date, time, mismatchDate, mismatchTime]);

  const setParam = (key, value) => {
    const n = value === "" ? 0 : Number(value);
    setParams((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));
  };

  const resetParamsToZero = () => {
    const p = {};
    for (const c of statConfigs) p[c.key] = 0;
    setParams(p);
  };

  const genId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}`;
  };

  const buildPayload = () => ({
    id: isEdit ? editData.id : genId(),
    episode: episode.trim(),
    date: date.trim(),
    time: time.trim(),
    parameters: { ...params },
    timestamp: isEdit ? editData.timestamp : new Date().toISOString(),
    aiComment: isEdit ? editData.aiComment : undefined,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "記録を編集" : "記録を追加"}
      description="エピソードと数値変化を入力します。"
      initialFocusRef={episodeRef}
      maxWidth={560}
    >
      <form
        className="record-form form-grid"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSubmit) return;
          if (submittingRef.current) return;

          submittingRef.current = true;
          setError("");

          try {
            await onSubmit?.(buildPayload());
            onClose?.();
          } catch (err) {
            setError(err?.message || "保存に失敗しました");
            submittingRef.current = false;
          }
        }}
      >
        <label className="field">
          <span className="label">エピソード</span>
          <textarea
            ref={episodeRef}
            className="input textarea"
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            placeholder="例: 2km走った、友達と話して楽しかった、夜更かしした…"
            rows={3}
          />
        </label>

        <div className="row2">
          <label className="field">
            <span className="label">日付</span>
            <input
              className={`input ${mismatchDate ? "input-error" : ""}`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="YYYY/MM/DD"
              inputMode="numeric"
            />
            {mismatchDate && <span className="error">例: 2026/01/21</span>}
          </label>

          <label className="field">
            <span className="label">時間</span>
            <input
              className={`input ${mismatchTime ? "input-error" : ""}`}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="HH:mm"
              inputMode="numeric"
            />
            {mismatchTime && <span className="error">例: 09:30</span>}
          </label>
        </div>

        <div className="params-head">
          <div className="params-title">数値（変化量）</div>
          <button
            type="button"
            className="chip"
            onClick={resetParamsToZero}
            title="全部 0 にする"
          >
            0にリセット
          </button>
        </div>

        <div className="params-grid">
          {statConfigs.map((c) => (
            <label key={c.key} className="field param-field">
              <span className="label param-label">{c.label}</span>
              <input
                className="input param-input"
                type="number"
                step="1"
                value={params?.[c.key] ?? 0}
                onChange={(e) => setParam(c.key, e.target.value)}
              />
            </label>
          ))}
        </div>

        {error && <div className="record-error">{error}</div>}

        <div className="actions">
          <button className="primary-btn" type="submit" disabled={!canSubmit}>
            {isEdit ? "更新" : "保存"}
          </button>
          <button className="secondary-btn" type="button" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </form>
    </Modal>
  );
}