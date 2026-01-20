// src/components/auth/LoginModal.jsx
import { useRef, useState } from "react";
import Modal from "../common/Modal";

export default function LoginModal({ open, onClose, onSubmit }) {
  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ログイン"
      description="アカウント情報を入力してください。"
      initialFocusRef={emailRef}
      maxWidth={520}
    >
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.({ email, pass });
        }}
      >
        <label className="field">
          <span className="label">メール</span>
          <input
            ref={emailRef}
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
            autoComplete="current-password"
          />
        </label>

        <div className="actions">
          <button className="primary-btn" type="submit">
            ログイン
          </button>
          <button className="secondary-btn" type="button" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </form>
    </Modal>
  );
}
