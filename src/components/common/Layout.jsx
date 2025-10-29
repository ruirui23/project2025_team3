import React from "react";
import BottomNavigation from "./BottomNavigation";
import "./Layout.css"; // 必要ならスタイルを追加

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <main className="app-main" style={{ paddingBottom: 80 }}>
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
