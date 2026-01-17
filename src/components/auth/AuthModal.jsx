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

  const API_BASE = "http://localhost:5173/api"

  async function loginApiRequest({ userName, password }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name: userName, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "ログイン失敗");
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
}

async function signupApiRequest({ userName, password }) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name: userName, password }),
  });

  if (!res.ok) {
    // エラーレスポンスの処理を追加
    const err = await res.json().catch(() => ({})); 
    throw new Error(err.error || "登録失敗");
  }
  return await res.json();
}

const handleSignup = async ({ userName, password }) => {
    try {
      const data = await signupApiRequest({ userName, password });
      
      // サインアップ成功後の処理
      // 注意: DB初期化等はここで行うか、ログイン後のフローに統一するか検討が必要
      const db = new IndexDB("GameDatabase", data.user_id); // dataの構造に合わせる(user_id)
      
      // サーバーから返ってきたトークン等を同期
      if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          // 必要であればIndexedDBへ同期
          // await db.syncUserFromServer(data.user_id, userName, data.access_token);
      }

      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: error.message }; // モーダル側でエラー表示するために返す
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
