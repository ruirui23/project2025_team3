// src/pages/Profile/ProfilePage.jsx
// - AppContext（useUser/useStatus）と連携したプロフィール
// - 未ログイン/ローディング/ログイン済みで表示を分岐
// - 表示名編集・ログアウト・ステータス簡易調整（サンプル）を用意

import { useEffect, useMemo, useState } from "react";
import "./Page.css";
import "./ProfilePage.css";

import StatusHeader from "../components/layout/StatusHeader";
import { useUser, useStatus } from "../components/features/AppProvider"; // パスはあなたの実体に合わせて調整

const STAT_CONFIGS = [
  { key: "health", label: "健康", min: 0, max: 100, step: 1 },
  { key: "happiness", label: "幸福度", min: 0, max: 100, step: 1 },
  { key: "mentalState", label: "精神状態", min: 0, max: 100, step: 1 },
  { key: "hunger", label: "満腹度", min: 0, max: 100, step: 1 },
];

export default function ProfilePage() {
  const { user, logout, setName } = useUser();
  const { status, setStatus } = useStatus();

  // AppProvider に isLoading があるので useApp から取るのが理想だが、
  // ここでは useUser/useStatus のどちらかに含めていない場合があるため保険。
  // もし useApp() を直接使えるなら isLoading を引き上げてください。
  const isLoading = false;

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");

  // ユーザーが切り替わったら表示名編集の下書きを同期
  useEffect(() => {
    setDraftName(user?.name ?? "");
    setEditing(false);
  }, [user?.id]);

  const isAuthed = !!user;

  const displayName = useMemo(() => {
    if (!user) return "";
    return (user.name || user.email || "User").trim();
  }, [user]);

  const emailText = useMemo(() => {
    if (!user) return "";
    return (user.email || "").trim();
  }, [user]);

  const onSaveName = async () => {
    const next = (draftName || "").trim();
    if (!next) return;
    await setName(next);
    setEditing(false);
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const onChangeStat = async (key, value) => {
    const conf = STAT_CONFIGS.find((s) => s.key === key);
    const next = conf ? clamp(value, conf.min, conf.max) : value;
    await setStatus({ [key]: next });
  };

  return (
    <>
      <StatusHeader />

      <main className="profile-page">
        {/* 未ログイン */}
        {!isAuthed && !isLoading && (
          <section className="card">
            <h2 className="card-title">プロフィール</h2>
            <p className="card-desc">
              ログインするとプロフィール情報とステータスの管理ができます。
            </p>

            {/* ここは「ログインモーダルを開く」導線に差し替え */}
            <div className="profile-actions">
              <button className="btn primary" onClick={() => alert("ログイン導線に接続してください")}>
                ログイン
              </button>
              <button className="btn" onClick={() => alert("サインアップ導線に接続してください")}>
                サインアップ
              </button>
            </div>
          </section>
        )}

        {/* ローディング */}
        {isLoading && (
          <section className="card">
            <h2 className="card-title">読み込み中...</h2>
            <p className="card-desc">ユーザー情報を取得しています。</p>
          </section>
        )}

        {/* ログイン済み */}
        {isAuthed && !isLoading && (
          <>
            {/* ユーザー情報 */}
            <section className="card">
              <div className="profile-top">
                <div className="profile-avatar" aria-hidden="true">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>

                <div className="profile-meta">
                  <div className="profile-name-row">
                    {!editing ? (
                      <>
                        <h2 className="card-title profile-name">{displayName}</h2>
                        <button
                          className="btn small"
                          onClick={() => setEditing(true)}
                          aria-label="表示名を編集"
                        >
                          編集
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          className="input"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder="表示名"
                          autoFocus
                        />
                        <div className="inline-actions">
                          <button className="btn small primary" onClick={onSaveName}>
                            保存
                          </button>
                          <button
                            className="btn small"
                            onClick={() => {
                              setDraftName(user?.name ?? "");
                              setEditing(false);
                            }}
                          >
                            キャンセル
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {emailText && <div className="profile-sub">{emailText}</div>}
                  <div className="profile-sub">UserId: {user.id}</div>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn danger" onClick={logout}>
                  ログアウト
                </button>
              </div>
            </section>

            {/* ステータス一覧 */}
            <section className="card">
              <h3 className="card-title">ステータス</h3>
              <p className="card-desc">スライダーで調整（例）。変更はローカルDBにも反映されます。</p>

              <div className="stats-grid">
                {STAT_CONFIGS.map((s) => {
                  const v = Number(status?.[s.key] ?? 0);
                  return (
                    <div key={s.key} className="stat-item">
                      <div className="stat-head">
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{v}</div>
                      </div>

                      <input
                        className="stat-range"
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={v}
                        onChange={(e) => onChangeStat(s.key, Number(e.target.value))}
                        aria-label={`${s.label}の値`}
                      />

                      <div className="stat-quick">
                        <button
                          className="btn small"
                          onClick={() => onChangeStat(s.key, v - s.step)}
                        >
                          -{s.step}
                        </button>
                        <button
                          className="btn small"
                          onClick={() => onChangeStat(s.key, v + s.step)}
                        >
                          +{s.step}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* アカウント操作（将来拡張枠） */}
            <section className="card">
              <h3 className="card-title">アカウント</h3>
              <p className="card-desc">
                今後ここに「パスワード変更」「データエクスポート」「ローカルデータ削除」などを追加できます。
              </p>

              <div className="profile-actions">
                <button className="btn" onClick={() => alert("未実装")}>
                  データをエクスポート（未実装）
                </button>
                <button className="btn danger" onClick={() => alert("未実装")}>
                  ローカルデータ削除（未実装）
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
