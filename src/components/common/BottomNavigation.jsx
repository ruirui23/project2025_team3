import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ITEMS = [
  { to: "/", label: "ホーム" },
  { to: "/tweet", label: "グラフ" },
  { to: "/game1", label: "履歴" },
  { to: "/profile", label: "プロフィール" },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height: window.innerWidth >= 768 ? "64px" : "56px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "#fff",
    borderTop: "1px solid #eee",
    zIndex: 1000,
    boxShadow: "0 -1px 4px rgba(0, 0, 0, 0.04)",
  };

  const baseItemStyle = useMemo(
    () => ({
      background: "transparent",
      border: 0,
      color: "#666",
      fontSize: window.innerWidth >= 768 ? "13px" : "12px",
      padding: "6px 8px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }),
    []
  );

  const activeStyle = {
    color: "#0b74de",
    fontWeight: 600,
  };

  const focusStyle = {
    outline: "2px solid rgba(11, 116, 222, 0.2)",
    outlineOffset: "2px",
  };

  return (
    <nav style={navStyle} role="navigation" aria-label="Bottom Navigation">
      {ITEMS.map((it) => {
        const isActive = location.pathname === it.to;
        return (
          <button
            key={it.to}
            type="button"
            style={{
              ...baseItemStyle,
              ...(isActive ? activeStyle : {}),
            }}
            onClick={() => navigate(it.to)}
            onKeyDown={(e) =>
              e.key === "Enter" || e.key === " " ? navigate(it.to) : null
            }
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => {
              e.target.style.outline = "none";
              e.target.style.outlineOffset = "0px";
            }}
            aria-current={isActive ? "page" : undefined}
          >
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
