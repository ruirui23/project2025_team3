import { useEffect, useState } from "react";
import "./StatusHeader.css";
import { useStatus } from "../features/AppProvider.jsx";

export default function StatusHeader() {
  const { status, isLoading } = useStatus();
  const STAT_CONFIGS = [
    { key: "health", label: "健康" },
    { key: "happiness", label: "幸福度" },
    { key: "mentalState", label: "精神状態" },
    { key: "hunger", label: "満腹度" },
  ];

  return (
    <div className="status-header" role="region" aria-label="ステータス">
      <div className="status-grid">
        {STAT_CONFIGS.map(({ key, label }) => (
          <div key={key} className="status-item" data-stat={key}>
            <span className="status-label">{label}</span>
            <span className="status-value">{isLoading ? "-" : status[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}