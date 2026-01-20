import { useEffect, useState } from "react";
import "./StatusHeader.css";
import { STAT_CONFIGS, useStatus } from "../features/AppProvider.jsx";

export default function StatusHeader() {
    const { status, isLoading } = useStatus();

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