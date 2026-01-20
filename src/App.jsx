import "./App.css";

import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "./components/features/AppProvider";
import LoginModal from "./components/auth/LoginModal";
import SignupModal from "./components/auth/SignupModal";

import Header from "./components/layout/Header";
import BottomNavigation from "./components/layout/BottomNavigation";

import Home from "./pages/HomePage";
import Analytics from "./pages/AnalyticsPage";
// import History from "./pages/HistoryPage";
// import Profile from "./pages/ProfilePage";
// import Game from "./pages/GamePage";
// import Settings from "./pages/Settings";

export default function App() {
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);
    return (
        <BrowserRouter>
            <AppProvider>
                <Header
                    onLoginClick={() => setLoginOpen(true)}
                    onSignupClick={() => setSignupOpen(true)}
                />

                <LoginModal
                    open={loginOpen}
                    onClose={() => setLoginOpen(false)}
                    onSubmit={(data) => {
                    console.log("login:", data);
                    setLoginOpen(false);
                    }}
                />
                <SignupModal
                    open={signupOpen}
                    onClose={() => setSignupOpen(false)}
                    onSubmit={(data) => console.log("signup", data)}
                />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/analytics" element={<Analytics />} />
                    {/*
                    <Route path="/history" element={<History />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/settings" element={<Settings />} />
                    */}
                </Routes>

                <BottomNavigation />
            </AppProvider>
        </BrowserRouter>
    );
}
