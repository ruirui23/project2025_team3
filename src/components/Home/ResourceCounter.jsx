import { useState, useEffect } from "react";
import {
  initializeDatabase,
  saveDataToDB,
  getAllDataFromDB,
} from "../../database/index_db";
import BottomNavigation from "../common/BottomNavigation";
import PostModal from "./PostModal";
import { getParameters, modifyData } from "../../services/data";

function ResourceCounter() {
  const [stats, setStats] = useState({
    health: 100,
    stress: 0,
    energy: 50,
    money: 1000,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [lastParameters, setLastParameters] = useState(null);

  // 初回ロード時にサーバーやローカルデータから取得
  useEffect(() => {
    getParameters()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  // アプリ起動時にデータベースを初期化
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log("DB初期化成功");
        // データベースから日記履歴を取得
        return getAllDataFromDB();
      })
      .then((records) => {
        if (records && records.length > 0) {
          console.log("取得した日記履歴:", records);
          // 時系列で逆順（最新順）にソート
          const sortedRecords = records.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setEpisodes(sortedRecords);

          // 最後のパラメータを取得
          if (sortedRecords.length > 0) {
            setLastParameters(sortedRecords[0].parameters);
          }
        }
      })
      .catch((error) => console.error("DB初期化失敗:", error));
  }, []);

  // 値を更新し、データを保存
  const updateStat = (statName, amount) => {
    setStats((prevStats) => {
      const newValue = prevStats[statName] + amount;
      modifyData(statName, amount).catch(() => {});
      return { ...prevStats, [statName]: newValue };
    });
  };

  const handlePostSubmit = async (data) => {
    try {
      await saveDataToDB(data);
      // 最後のパラメータを保存
      setLastParameters(data.parameters);
      // エピソードをリストに追加（最新順）
      setEpisodes([data, ...episodes]);

      // パラメータを更新
      const newStats = { ...stats };
      Object.keys(data.parameters).forEach((key) => {
        newStats[key] = newStats[key] + data.parameters[key];
        if (data.parameters[key] !== 0) {
          modifyData(key, data.parameters[key]).catch(() => {});
        }
      });
      setStats(newStats);
    } catch (error) {
      console.error("データ保存エラー:", error);
    }
  };

  const statConfigs = [
    { key: "health", label: "体力", color: "#4CAF50", initialValue: 100 },
    { key: "stress", label: "ストレス", color: "#f44336", initialValue: 0 },
    { key: "energy", label: "空腹度", color: "#FF9800", initialValue: 50 },
    { key: "money", label: "お金", color: "#2196F3", initialValue: 1000 },
  ];

  return (
    <>
      <style>{`
        .status-header {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          z-index: 998;
        }

        .status-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 2px solid;
          background: white;
        }

        .status-label {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-value {
          font-size: 1.3rem;
          font-weight: bold;
        }

        .main-content {
          margin-top: 140px;
          padding-bottom: 80px;
        }

        .resource-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          color: #333;
          text-align: center;
        }

        .resource-container h2 {
          margin: 0 0 2rem 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #333;
        }

        .resource-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
        }

        .resource-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 15px;
          padding: 1.5rem;
          border: 3px solid;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          flex: 1;
          min-width: 150px;
          max-width: 200px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .resource-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .resource-label {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
        }

        .resource-value {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 1rem 0;
          color: #333;
        }

        /* レスポンシブデザイン */
        @media (max-width: 768px) {
          .status-header {
            top: 60px;
            padding: 0.8rem 1rem;
          }

          .status-grid {
            gap: 0.5rem;
          }

          .status-item {
            padding: 0.4rem 0.8rem;
          }

          .status-label {
            font-size: 0.8rem;
          }

          .status-value {
            font-size: 1.1rem;
          }

          .main-content {
            margin-top: 120px;
          }

          .resource-grid {
            flex-direction: column;
            align-items: center;
          }
          
          .resource-card {
            min-width: 130px;
            max-width: 180px;
            width: 100%;
          }
          
          .resource-value {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .resource-container {
            padding: 1rem;
            margin: 1rem;
          }

          .status-grid {
            gap: 0.3rem;
          }

          .status-item {
            padding: 0.3rem 0.6rem;
          }
        }

        /* フローティングボタン */
        .floating-button {
          position: fixed;
          right: 2rem;
          bottom: 6rem;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #00bcd4;
          color: white;
          border: none;
          font-size: 2rem;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 0;
        }

        .floating-button:hover {
          background: #00acc1;
        }

        @media (max-width: 768px) {
          .floating-button {
            right: 1.5rem;
            bottom: 5rem;
            width: 48px;
            height: 48px;
            font-size: 1.6rem;
          }
        }
      `}</style>

      {/* 固定パラメータヘッダー */}
      <div className="status-header">
        <div className="status-grid">
          {statConfigs.map(({ key, label, color }) => (
            <div
              key={key}
              className="status-item"
              style={{ borderColor: color }}
            >
              <span className="status-label" style={{ color }}>
                {label}
              </span>
              <span className="status-value" style={{ color }}>
                {stats[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="main-content">
        {/* エピソードリスト */}
        {episodes.length > 0 && (
          <div
            className="resource-container"
            style={{
              marginTop: "2rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.3rem",
                marginBottom: "1.5rem",
                color: "#333",
                textAlign: "left",
              }}
            >
              タイムライン
            </h3>
            {episodes.map((ep) => (
              <div
                key={ep.id}
                style={{
                  background: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  padding: "1.2rem",
                  marginBottom: "1rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#888",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {ep.date} {ep.time}
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#333",
                        lineHeight: "1.6",
                      }}
                    >
                      {ep.episode}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.3rem",
                      minWidth: "80px",
                      alignItems: "flex-end",
                    }}
                  >
                    {statConfigs.map(({ key, label, color }) => {
                      const value = ep.parameters[key];
                      if (value === 0) return null;
                      return (
                        <div
                          key={key}
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: color,
                          }}
                        >
                          {value > 0 ? "+" : ""}
                          {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フローティング投稿ボタン */}
      <button
        className="floating-button"
        onClick={() => setIsModalOpen(true)}
        title="エピソードを投稿"
      >
        +
      </button>

      {/* 投稿モーダル */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostSubmit}
        lastParameters={lastParameters || stats}
      />

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </>
  );
}

export default ResourceCounter;
