import { useMemo, useState } from "react";
import Modal from "./Modal";

export default function LoginModal({
  open,
  onClose,
  onMoveSignup,
  submitting,
  setSubmitting,
  loginApi,
}) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const error = useMemo(() => {
    if (!userName.trim()) return "ユーザー名を入力してください";
    if (!password) return "パスワードを入力してください";
    return "";
  }, [userName, password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (error || submitting) return;

    setSubmitting(true);
    try {
      const res = await loginApi({ userName, password, remember });
      if (res?.ok) onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ログイン"
      description="ユーザー名とパスワードでログインします。"
    >
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <div className="label">ユーザー名</div>
            <input
              className="input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
              placeholder="例: sorairo"
            />
          </div>

          <div className="field">
            <div className="label">パスワード</div>
            <div className="input-row">
              <input
                className="input"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button type="button" className="toggle-btn" onClick={() => setShowPw((v) => !v)}>
                {showPw ? "隠す" : "表示"}
              </button>
            </div>

            <div className="row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                ログイン状態を保持
              </label>

              <button
                type="button"
                className="link-btn"
                onClick={() => alert("TODO: パスワードリセット導線")}
              >
                パスワードを忘れた
              </button>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="actions">
            <button className="primary-btn" type="submit" disabled={!!error || submitting}>
              {submitting ? "ログイン中..." : "ログイン"}
            </button>

            <button className="secondary-btn" type="button" onClick={onMoveSignup}>
              アカウント作成へ
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
