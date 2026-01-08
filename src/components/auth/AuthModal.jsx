import { useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

export default function AuthModals({
  loginOpen,
  signupOpen,
  openLogin,
  openSignup,
  closeAll,
}) {
  // 実装が進んだら Context/Store に移せる
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const loginApi = async ({ userName, password, remember }) => {
    // TODO: API接続に置き換え
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true };
  };

  const signupApi = async ({ userName, password }) => {
    // TODO: API接続に置き換え
    await new Promise((r) => setTimeout(r, 550));
    return { ok: true };
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
