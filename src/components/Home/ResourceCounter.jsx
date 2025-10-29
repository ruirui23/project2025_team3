import { useState, useEffect } from "react";
import BottomNavigation from "../common/BottomNavigation";
import { getParameters, modifyData } from "../../services/data";

function ResourceCounter() {
  const [stats, setStats] = useState({
    health: 100, // 体力
    stress: 0, // ストレス
    energy: 50, // エネルギー（ご飯）
    money: 1000, // お金
  });

  // 初回ロード時にサーバーやローカルデータから取得
  useEffect(() => {
    getParameters()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  // 値を更新し、データを保存
  const updateStat = (statName, amount) => {
    setStats((prevStats) => {
      const newValue = Math.max(0, prevStats[statName] + amount);
      modifyData(statName, amount).catch(() => {});
      return { ...prevStats, [statName]: newValue };
    });
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
          font-size: 2rem;
          font-weight: 600;
          color: #333;
        }

        .resource-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .resource-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 15px;
          padding: 1.5rem;
          border: 3px solid;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          flex: 1;
          min-width: 200px;
          max-width: 250px;
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

        .resource-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .resource-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          min-height: 40px;
        }

        .resource-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .resource-btn:active {
          transform: translateY(0);
        }

        .increment-btn {
          opacity: 0.9;
        }

        .increment-btn:hover {
          opacity: 1;
        }

        .decrement-btn {
          opacity: 0.8;
        }

        .decrement-btn:hover {
          opacity: 1;
        }

        /* レスポンシブデザイン */
        @media (max-width: 768px) {
          .resource-grid {
            flex-direction: column;
            align-items: center;
          }
          
          .resource-card {
            min-width: 180px;
            max-width: 300px;
            width: 100%;
          }
          
          .resource-value {
            font-size: 2rem;
          }
          
          .resource-btn {
            font-size: 0.8rem;
            padding: 6px 10px;
          }
        }

        @media (max-width: 480px) {
          .resource-container {
            padding: 1rem;
            margin: 1rem;
          }
          
          .resource-buttons {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
      <div className="resource-container">
        <h2>ステータス</h2>
        <div className="resource-grid">
          {statConfigs.map(({ key, label, color }) => (
            <div
              key={key}
              className="resource-card"
              style={{ borderColor: color }}
            >
              <h3 className="resource-label" style={{ color }}>
                {label}
              </h3>
              <div className="resource-value" style={{ color }}>
                {stats[key]}
              </div>
              <div className="resource-buttons">
                <button
                  className="resource-btn increment-btn"
                  onClick={() => updateStat(key, 1)}
                  style={{ backgroundColor: color }}
                >
                  +1
                </button>
                <button
                  className="resource-btn increment-btn"
                  onClick={() => updateStat(key, 10)}
                  style={{ backgroundColor: color }}
                >
                  +10
                </button>
                <button
                  className="resource-btn decrement-btn"
                  onClick={() => updateStat(key, -1)}
                  style={{ backgroundColor: "#666" }}
                >
                  -1
                </button>
                <button
                  className="resource-btn decrement-btn"
                  onClick={() => updateStat(key, -10)}
                  style={{ backgroundColor: "#666" }}
                >
                  -10
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </>
  );
}

export default ResourceCounter;
