import { useEffect, useState } from "react";
import "./Page.css";
import "./AnalyticsPage.css";

export default function Analytics() {
    return (

        <main className="analytics-page">
            <section className="card">
                <h2 className="card-title">Analytics</h2>
                <p className="card-desc">
                    ここに分析画面のコンテンツを追加していきます。
                </p>

                {/* 例: ステータス更新（仮）
                <button onClick={() => setStats(s => ({...s, health: s.health + 1}))}>
                    健康+1
                </button>
                */}
            </section>
        </main>
    );
}
