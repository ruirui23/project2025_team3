import { useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { IndexDB } from "../../database/index_db.js";

export default function AuthModals({
  loginOpen,
  signupOpen,
  openLogin,
  openSignup,
  closeAll,
}) {
  // 実装が進んだら Context/Store に移せる
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const API_URL = "http://localhost:5173/auth"

  const loginApi = async ({ userName, password, remember }) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: password}),
      });

      if(!response.ok) {
        throw new Error("ログインに失敗しました");
      }
      const data = await response.json();
      //成功したらローカルに一時保存
      const db = new IndexDB("GameDatabase", data.userId);

      await db.syncUserFromServer(data.userId, data.userName, data.token);

      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: error.message };
    }
  };

  const signupApi = async ({ userName, password }) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: password }),
      });

      if (!response.ok) {
        throw new Error("登録に失敗しました");
      }

      const data = await response.json();
      
      // サインアップ直後に自動ログイン状態にするなら、ここでも保存処理を行う
      const db = new IndexDB("GameDatabase", data.userId);
      await db.syncUserFromServer(data.userId, data.userName, data.token);

      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: error.message };
    }
  };

  return (
    <>
      <LoginModal
        open={loginOpen}
        onClose={closeAll}
        onMoveSignup={openSignup}
        submitting={authSubmitting}
        setSubmitting={setAuthSubmitting}
        loginApi={loginApi}
      />
      <SignupModal
        open={signupOpen}
        onClose={closeAll}
        onMoveLogin={openLogin}
        submitting={authSubmitting}
        setSubmitting={setAuthSubmitting}
        signupApi={signupApi}
      />
    </>
  );
}
