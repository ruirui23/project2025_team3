import "./SignupModal.css";

import { useRef, useState } from "react";
import Modal from "../common/Modal";

export default function SignupModal({ open, onClose, onSubmit }) {
  const emailRef = useRef(null);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  // ここ重要: JSXより前に定義
  const mismatch = pass !== "" && confirm !== "" && pass !== confirm;
  const canSubmit = email.trim() !== "" && pass !== "" && confirm !== "" && !mismatch;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="サインアップ"
      description="新しいアカウントを作成します。"
      initialFocusRef={emailRef}
      maxWidth={520}
    >
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();

          if (!canSubmit) return;

          // confirm は送らない運用の方が一般的
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