// src/pages/Home/Home.jsx
// 固定ステータスヘッダー付きのホーム（UI骨格）
// - データ取得/更新は差し替えやすいようにコメントアウト枠を用意
// - 下部BottomNavigationの分だけ余白を確保（Home.css）

import { useEffect, useState } from "react";
import "./Page.css";
import "./HomePage.css";

import StatusHeader from "../components/layout/StatusHeader";

const STAT_CONFIGS = [
    { key: "health", label: "健康" },
    { key: "happiness", label: "幸福度" },
    { key: "mentalState", label: "精神状態" },
    { key: "hunger", label: "満腹度" },
];

const INITIAL_STATS = {
    health: 100,
    happiness: 50,
    mentalState: 50,
    hunger: 0,
};

export default function Home() {
    // 一時保持（差し替え可）
    const [stats, setStats] = useState(INITIAL_STATS);
    // const [isLoading, setIsLoading] = useState(true);

    // データ取得が必要ならここに差し替え
    useEffect(() => {
        /*
        let alive = true;
        (async () => {
        try {
            // const data = await getParameters();
            // if (!alive) return;
            // setStats((prev) => ({ ...prev, ...data }));
        } finally {
            // if (alive) setIsLoading(false);
        }
        })();
        return () => { alive = false; };
        */
    }, []);

    return (
        <>
        <StatusHeader />
        <main className="home-page">
            <section className="card">
                <h2 className="card-title">Home</h2>
                <p className="card-desc">
                    ここにホーム画面のコンテンツを追加していきます。
                </p>

                {/* 例: ステータス更新（仮）
                <button onClick={() => setStats(s => ({...s, health: s.health + 1}))}>
                    健康+1
                </button>
                */}
            </section>
        </main>
        </>
    );
}
