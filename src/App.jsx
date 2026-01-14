import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import ResourceCounter from "./components/Home/ResourceCounter";
import BottomNavigation from "./components/common/BottomNavigation";
import Tweet from "./components/Tweet/Tweet";
import AuthModals from "./components/auth/AuthModal";
import Game1 from "./components/Game1/Game1";

function Profile() {
  return <h2>Profile Page</h2>;
}

export default function App() {
  const [auth, setAuth] = useState({ login: false, signup: false });

  return (
    <BrowserRouter>
      {/* 固定ヘッダー */}
      <div className="app-header">
        <div className="app-header-left-spacer" />
        <div className="app-header-title">自己管理</div>

        <div className="auth-buttons">
          <button className="auth-btn login" onClick={() => setAuth({ login: true, signup: false })}>
            ログイン
          </button>
          <button className="auth-btn signup" onClick={() => setAuth({ login: false, signup: true })}>
            サインアップ
          </button>
        </div>
      </div>

      <div className="app-main">
        <div className="app-main-inner">
          <Routes>
            <Route path="/" element={<ResourceCounter />} />
            <Route path="/tweet" element={<Tweet />} />
            <Route path="/game1" element={<Game1 />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>

      <BottomNavigation />

      <AuthModals
        loginOpen={auth.login}
        signupOpen={auth.signup}
        openLogin={() => setAuth({ login: true, signup: false })}
        openSignup={() => setAuth({ login: false, signup: true })}
        closeAll={() => setAuth({ login: false, signup: false })}
      />
    </BrowserRouter>
  );
}
