import { useMemo, useState } from "react";
import Modal from "./Modal";

export default function SignupModal({
  open,
  onClose,
  onMoveLogin,
  submitting,
  setSubmitting,
  signupApi,
}) {
  const [userName, setUserName] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [agree, setAgree] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const error = useMemo(() => {
    if (!userName.trim()) return "ユーザー名を入力してください";
    if (!pw1) return "パスワードを入力してください";
    if (pw1.length < 8) return "パスワードは8文字以上にしてください";
    if (pw1 !== pw2) return "パスワードが一致しません";
    if (!agree) return "利用規約に同意してください";
    return "";
  }, [userName, pw1, pw2, agree]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (error || submitting) return;

    setSubmitting(true);
    try {
      const res = await signupApi({ userName, password: pw1 });
      if (res?.ok) {
        onClose?.();
        onMoveLogin?.(); // 作成後にログインへ誘導（任意）
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="サインアップ"
      description="新しいアカウントを作成します。"
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
                type={show1 ? "text" : "password"}
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                autoComplete="new-password"
                placeholder="8文字以上"
              />
              <button type="button" className="toggle-btn" onClick={() => setShow1((v) => !v)}>
                {show1 ? "隠す" : "表示"}
              </button>
            </div>
          </div>

          <div className="field">
            <div className="label">パスワード（確認）</div>
            <div className="input-row">
              <input
                className="input"
                type={show2 ? "text" : "password"}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                placeholder="もう一度入力"
              />
              <button type="button" className="toggle-btn" onClick={() => setShow2((v) => !v)}>
                {show2 ? "隠す" : "表示"}
              </button>
            </div>
          </div>

          <label className="checkbox">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            利用規約に同意します
          </label>

          {error ? <div className="error">{error}</div> : null}

          <div className="actions">
            <button className="primary-btn" type="submit" disabled={!!error || submitting}>
              {submitting ? "作成中..." : "アカウント作成"}
            </button>

            <button className="secondary-btn" type="button" onClick={onMoveLogin}>
              すでにアカウントがある（ログインへ）
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
