import "./SignupModal.css";

import { useRef, useState } from "react";
import Modal from "../common/Modal";

export default function SignupModal({ open, onClose, onSubmit }) {
  const userNameRef = useRef(null);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  // validation
  const mismatch = pass !== "" && confirm !== "" && pass !== confirm;
  const canSubmit =
    userName.trim() !== "" &&
    email.trim() !== "" &&
    pass !== "" &&
    confirm !== "" &&
    !mismatch;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="サインアップ"
      description="新しいアカウントを作成します。"
      initialFocusRef={userNameRef}
      maxWidth={520}
    >
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;

          // confirm は送らない
          onSubmit?.({
            user_name: userName.trim(),
            email: email.trim(),
            pass,
          });
        }}
      >
        <label className="field">
          <span className="label">ユーザー名</span>
          <input
            ref={userNameRef}
            className="input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="field">
          <span className="label">メール</span>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span className="label">パスワード</span>
          <input
            className="input"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="field">
          <span className="label">パスワード（確認）</span>
          <input
            className={`input ${mismatch ? "input-error" : ""}`}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {mismatch && <span className="error">パスワードが一致しません</span>}
        </label>

        <div className="actions">
          <button className="primary-btn" type="submit" disabled={!canSubmit}>
            登録
          </button>
          <button className="secondary-btn" type="button" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </form>
    </Modal>
  );
}
