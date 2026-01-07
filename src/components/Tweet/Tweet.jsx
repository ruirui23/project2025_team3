import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { getAllDataFromDB } from "../../database/index_db";

export default function Tweet() {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataFromDB = async () => {
      try {
        const records = await getAllDataFromDB();
        console.log("取得したレコード:", records);

        // 日時ごとにデータを集計
        const aggregatedData = aggregateDataByDateTime(records);
        setChartData(aggregatedData);
        setLoading(false);
      } catch (err) {
        setError(`エラー: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDataFromDB();
  }, []);

  // 日付と時間ごとにデータを集計する関数
  const aggregateDataByDateTime = (records) => {
    if (!records || records.length === 0) {
      return [];
    }

    // タイムスタンプで時系列にソート
    const sortedRecords = records.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // 各レコードを日時フォーマットで変換
    return sortedRecords.map((record, index) => {
      const dateTime = new Date(record.timestamp).toLocaleString("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        datetime: dateTime,
        timestamp: new Date(record.timestamp).getTime(), // ソート用
        health: record.parameters?.health || 0,
        happiness: record.parameters?.happiness || 0,
        mentalState: record.parameters?.mentalState || 0,
        hunger: record.parameters?.hunger || 0,
      };
    });
  };

  const chartConfigs = [
    { key: "health", label: "健康", color: "#4CAF50" },
    { key: "happiness", label: "幸福度", color: "#FF9800" },
    { key: "mentalState", label: "精神状態", color: "#2196F3" },
    { key: "hunger", label: "満腹度", color: "#f44336" },
  ];

  return (
    <div className="tweet-container" style={{ padding: "1rem" }}>
      <style>{`
        .tweet-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tweet-container h2 {
          text-align: center;
          color: #333;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-left: 4px solid;
        }

        .chart-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          color: #333;
        }

        .chart-card.health {
          border-left-color: #4CAF50;
        }

        .chart-card.happiness {
          border-left-color: #FF9800;
        }

        .chart-card.mentalState {
          border-left-color: #2196F3;
        }

        .chart-card.hunger {
          border-left-color: #f44336;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: #999;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .tweet-container {
            padding: 0.5rem;
          }
        }
      `}</style>

      <h2>折れ線グラフ</h2>

      {loading && <div className="no-data">読み込み中...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && chartData.length > 0 ? (
        <div className="charts-grid">
          {chartConfigs.map(({ key, label, color }) => (
            <div key={key} className={`chart-card ${key}`}>
              <h3 style={{ color }}>{label}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="datetime"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={
                      chartData.length > 10
                        ? Math.floor(chartData.length / 10)
                        : 0
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="linear"
                    dataKey={key}
                    stroke={color}
                    dot={{ fill: color, r: 4 }}
                    activeDot={{ r: 6 }}
                    name={label}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="no-data">データがまだ登録されていません</div>
        )
      )}
    </div>
  );
}
