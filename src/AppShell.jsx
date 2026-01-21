import { useState } from "react";
import { useUser } from "./components/features/AppProvider";

import Header from "./components/layout/Header";
import LoginModal from "./components/modal/LoginModal";
import SignupModal from "./components/modal/SignupModal";
import RecordModal from "./components/modal/RecordModal";

const STAT_CONFIGS = [
  { key: "health", label: "健康" },
  { key: "happiness", label: "幸福度" },
  { key: "mentalState", label: "精神状態" },
  { key: "hunger", label: "満腹度" },
];

export default function AppShell() {
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);
    const [recordOpen, setRecordOpen] = useState(false);
    const { user, login, signup } = useUser(); // ✅ Provider配下なのでOK


    const onLogin = async ({ email, pass }) => {
        try {
            const res = await login({ email, pass }); // ← API呼ぶ（await必須）
            console.log("ログイン成功:", res);
        } catch (err) {
            console.error("ログイン失敗:", err?.message ?? err);
        }
    };

    const onSignup = async ({ email, user_name, pass }) => {
        try {
            const res = await signup({ email, user_name, pass }); // ← API呼ぶ（await必須）
            console.log("サインアップ成功:", res);
        } catch (err) {
            console.error("サインアップ失敗:", err?.message ?? err);
        }
    };

    const handlePostSubmit = async (payload) => {
        console.log("record submit:", payload);
    };

    return (
        <>
            <Header
                user={user}
                onLoginClick={() => setLoginOpen(true)}
                onSignupClick={() => setSignupOpen(true)}
                onProfileClick={() => console.log("profile")}
            />

            <LoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onSubmit={onLogin}
            />
            <SignupModal
                open={signupOpen}
                onClose={() => setSignupOpen(false)}
                onSubmit={onSignup}
            />
            <RecordModal
                open={recordOpen}
                onClose={() => setRecordOpen(false)}
                onSubmit={handlePostSubmit}
                statConfigs={STAT_CONFIGS}
                defaultParams={{}}
                editData={null}
            />

            <button
                type="button"
                className="floating-button"
                onClick={() => setRecordOpen(true)}
                title="エピソードを投稿"
            >
                +
            </button>
        </>
    );
}