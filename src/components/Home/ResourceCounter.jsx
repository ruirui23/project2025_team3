import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  initializeDatabase,
  saveDataToDB,
  getAllDataFromDB,
  updatePostInDB,
  deletePostFromDB,
  updatePostCommentInDB,
} from "../../database/index_db";
import BottomNavigation from "../common/BottomNavigation";
import PostModal from "./PostModal";
import { getParameters, modifyData } from "../../services/data";
import { generateEncouragingComment } from "../../services/gemini";

function ResourceCounter() {
  const [stats, setStats] = useState({
    health: 100,
    happiness: 50,
    mentalState: 50,
    hunger: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [lastParameters, setLastParameters] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentExpandedPostIds, setCommentExpandedPostIds] = useState(
    new Set()
  );
  const [loadingCommentPostId, setLoadingCommentPostId] = useState(null);
  const [commentErrors, setCommentErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // 初回ロード時にサーバーやローカルデータから取得
  useEffect(() => {
    getParameters()
      .then((data) => {
        if (data && data.health !== undefined) {
          setStats(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsStatsLoading(false));
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
      const newStats = {
        ...prevStats,
        [statName]: prevStats[statName] + amount,
      };
      modifyData(newStats).catch(() => {});
      return newStats;
    });
  };

  const handlePostSubmit = async (data) => {
    try {
      if (editingPost) {
        // 編集モード
        await updatePostInDB(data.id, data);
        // エピソードリストを更新
        const updatedEpisodes = episodes.map((ep) =>
          ep.id === data.id ? data : ep
        );
        setEpisodes(updatedEpisodes);

        // パラメータの差分を計算して更新
        const oldParams = editingPost.parameters;
        const newStats = { ...stats };
        let hasChanges = false;
        Object.keys(data.parameters).forEach((key) => {
          const diff = data.parameters[key] - oldParams[key];
          if (diff !== 0) {
            newStats[key] = newStats[key] + diff;
            hasChanges = true;
          }
        });
        if (hasChanges) {
          modifyData(newStats).catch(() => {});
        }
        setStats(newStats);
        setEditingPost(null);
      } else {
        // 新規投稿モード
        await saveDataToDB(data);
        // 最後のパラメータを保存
        setLastParameters(data.parameters);
        // エピソードをリストに追加（最新順）
        setEpisodes([data, ...episodes]);

        // パラメータを更新
        const newStats = { ...stats };
        Object.keys(data.parameters).forEach((key) => {
          newStats[key] = newStats[key] + data.parameters[key];
        });
        modifyData(newStats).catch(() => {});
        setStats(newStats);
      }
    } catch (error) {
      console.error("データ保存エラー:", error);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (post) => {
    if (window.confirm("この投稿を削除しますか？")) {
      try {
        await deletePostFromDB(post.id);
        // エピソードリストから削除
        setEpisodes(episodes.filter((ep) => ep.id !== post.id));

        // パラメータを戻す
        const newStats = { ...stats };
        Object.keys(post.parameters).forEach((key) => {
          newStats[key] = newStats[key] - post.parameters[key];
        });
        modifyData(newStats).catch(() => {});
        setStats(newStats);
      } catch (error) {
        console.error("データ削除エラー:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const togglePostActions = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const toggleAiComment = async (post) => {
    // 既に開いている場合は閉じる
    if (commentExpandedPostIds.has(post.id)) {
      setCommentExpandedPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
      return;
    }

    // 初回生成の場合
    if (!post.aiComment) {
      setLoadingCommentPostId(post.id);
      setCommentErrors((prev) => ({ ...prev, [post.id]: null }));

      try {
        const comment = await generateEncouragingComment(
          post.episode,
          post.parameters
        );
        await updatePostCommentInDB(post.id, comment);

        // エピソードリストを更新
        setEpisodes((prevEpisodes) =>
          prevEpisodes.map((ep) =>
            ep.id === post.id ? { ...ep, aiComment: comment } : ep
          )
        );

        setCommentExpandedPostIds((prev) => new Set(prev).add(post.id));
      } catch (error) {
        console.error("AIコメント生成エラー:", error);
        setCommentErrors((prev) => ({
          ...prev,
          [post.id]: error.message || "コメントの生成に失敗しました",
        }));
      } finally {
        setLoadingCommentPostId(null);
      }
    } else {
      // 既に生成済みの場合は表示のみ
      setCommentExpandedPostIds((prev) => new Set(prev).add(post.id));
    }
  };

  const statConfigs = [
    { key: "health", label: "健康", color: "#4CAF50", initialValue: 100 },
    { key: "happiness", label: "幸福度", color: "#FF9800", initialValue: 50 },
    { key: "mentalState", label: "精神状態", color: "#2196F3", initialValue: 50 },
    { key: "hunger", label: "満腹度", color: "#f44336", initialValue: 0 },
  ];

  // 選択日付の投稿をフィルタリング
  const getEpisodesForSelectedDate = () => {
    // 選択日付をYYYY/MM/DD形式で取得
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const selectedDateStr = `${year}/${month}/${day}`;
    const selectedDateStrShort = `${month}/${day}`;

    const filtered = episodes
      .filter((ep) => {
        const epDate = ep.date || "";
        // 新しい形式（YYYY/MM/DD）と古い形式（MM/DD）の両方に対応
        const match =
          epDate === selectedDateStr || epDate === selectedDateStrShort;
        return match;
      })
      .sort((a, b) => {
        const timeA = a.time || "00:00";
        const timeB = b.time || "00:00";
        return timeA.localeCompare(timeB);
      });

    return filtered;
  };

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

        .post-episode {
          cursor: pointer;
          transition: background 0.2s;
          padding: 0.5rem;
          border-radius: 6px;
          margin: -0.5rem;
        }

        .post-episode:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .post-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .post-action-btn {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-btn {
          background: #2196F3;
          color: white;
        }

        .edit-btn:hover {
          background: #1976D2;
        }

        .delete-btn {
          background: #f44336;
          color: white;
        }

        .delete-btn:hover {
          background: #d32f2f;
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

        /* カレンダースタイル */
        .calendar-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .calendar-container h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #333;
        }

        .calendar-wrapper {
          display: flex;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .react-calendar {
          width: 100%;
          max-width: 700px;
          background: white;
          border: none;
          border-radius: 12px;
          font-family: inherit;
          line-height: 1.125em;
        }

        .react-calendar--compact {
          width: auto;
        }

        .react-calendar--single-month {
          width: 100%;
        }

        .react-calendar .react-calendar__navigation {
          margin-bottom: 1.5rem;
        }

        .react-calendar__navigation button {
          margin: 0.5rem;
          font-size: 0.95rem;
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
        }

        .react-calendar__month-view__days__day {
          margin: 0;
          padding: 0.8rem 0;
        }

        .react-calendar__navigation__label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #e0e0e0;
        }

        .react-calendar__month-view__weekdays {
          margin-bottom: 0.5rem;
        }

        .react-calendar__month-view__weekdays__weekday {
          padding: 0.8rem 0;
          font-weight: 600;
          color: #666;
          font-size: 0.9rem;
        }

        .react-calendar__month-view__days {
          padding: 0.5rem 0;
        }

        .react-calendar__tile {
          padding: 0.8rem 0;
          border-radius: 8px;
          font-weight: 500;
          color: #333;
          transition: all 0.2s ease;
        }

        .react-calendar__tile--now {
          background: #e3f2fd;
          color: #1976d2;
          font-weight: 700;
        }

        .react-calendar__tile--active,
        .react-calendar__tile--hasActive {
          background: #00bcd4;
          color: white;
          font-weight: 700;
        }

        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus,
        .react-calendar__tile--hasActive:enabled:hover,
        .react-calendar__tile--hasActive:enabled:focus {
          background: #00acc1;
        }

        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: #f0f0f0;
        }

        .react-calendar__tile--disabled {
          background-color: transparent;
          color: #ccc;
        }

        /* レスポンシブカレンダー */
        @media (max-width: 768px) {
          .calendar-container {
            margin: 1.5rem;
            padding: 1.5rem;
          }

          .react-calendar {
            max-width: 100%;
          }

          .react-calendar__navigation button {
            margin: 0.3rem;
            font-size: 0.85rem;
            padding: 0.5rem 0.6rem;
          }

          .react-calendar__month-view__days__day {
            margin: 0;
            padding: 0.6rem 0;
          }

          .react-calendar__tile {
            padding: 0.6rem 0;
          }
        }

        /* 詳細表示スタイル */
        .detail-view-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .detail-view-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .detail-view-date {
          font-size: 1.5rem;
          font-weight: 700;
          color: #00bcd4;
        }

        .detail-view-count {
          background: #f5f5f5;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #666;
        }

        .hourly-timeline {
          position: relative;
          padding: 1rem 0;
        }

        .hourly-group {
          margin-bottom: 1.5rem;
          padding-left: 3rem;
          position: relative;
        }

        .hourly-time {
          position: absolute;
          left: 0;
          top: 0;
          font-weight: 700;
          color: #00bcd4;
          font-size: 0.95rem;
          min-width: 2.5rem;
        }

        .hourly-marker {
          position: absolute;
          left: 1rem;
          top: 0.3rem;
          width: 10px;
          height: 10px;
          background: #00bcd4;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #00bcd4;
        }

        .hourly-line {
          position: absolute;
          left: 1.5rem;
          top: 20px;
          width: 2px;
          height: calc(100% - 20px);
          background: #e0f2f1;
        }

        .hourly-episodes {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .hourly-episode-card {
          background: #f8f9fa;
          border-left: 3px solid #00bcd4;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.2s ease;
        }

        .hourly-episode-card:hover {
          background: #f0f7f8;
          box-shadow: 0 2px 8px rgba(0, 188, 212, 0.15);
        }

        .episode-text {
          font-size: 1rem;
          color: #333;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }

        .episode-params {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        .param-badge {
          display: inline-block;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          background: white;
          border: 1px solid;
        }

        .detail-actions {
          margin-top: 0.8rem;
          padding-top: 0.8rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .detail-action-btn {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .detail-edit-btn {
          background: #2196F3;
          color: white;
        }

        .detail-edit-btn:hover {
          background: #1976D2;
          transform: translateY(-1px);
        }

        .detail-delete-btn {
          background: #f44336;
          color: white;
        }

        .detail-delete-btn:hover {
          background: #d32f2f;
          transform: translateY(-1px);
        }

        .no-episodes-message {
          text-align: center;
          padding: 2rem;
          color: #999;
          font-size: 1rem;
        }

        .no-episodes-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* レスポンシブ詳細ビュー */
        @media (max-width: 768px) {
          .detail-view-container {
            margin: 1.5rem;
            padding: 1.5rem;
          }

          .detail-view-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .detail-view-date {
            font-size: 1.2rem;
          }

          .hourly-group {
            padding-left: 2.5rem;
            margin-bottom: 1.2rem;
          }

          .hourly-time {
            font-size: 0.9rem;
            min-width: 2rem;
          }

          .hourly-marker {
            left: 0.75rem;
          }

          .hourly-line {
            left: 1.25rem;
          }

          .episode-text {
            font-size: 0.95rem;
          }

          .param-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .detail-view-container {
            padding: 1rem;
            margin: 1rem;
          }

          .detail-view-date {
            font-size: 1rem;
          }

          .detail-view-count {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }

          .hourly-group {
            padding-left: 2rem;
          }

          .hourly-time {
            font-size: 0.85rem;
          }

          .hourly-episode-card {
            padding: 0.8rem;
          }

          .episode-params {
            gap: 0.4rem;
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
                {isStatsLoading ? "-" : stats[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="main-content">
        {/* カレンダーセクション */}
        <div className="calendar-container">
          <h3>カレンダー</h3>
          <div className="calendar-wrapper">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="ja-JP"
              calendarType="gregory"
            />
          </div>
        </div>

        {/* 選択日付の詳細ビュー */}
        {getEpisodesForSelectedDate().length > 0 ? (
          <div className="detail-view-container">
            <div className="detail-view-header">
              <div className="detail-view-date">
                {selectedDate.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </div>
              <div className="detail-view-count">
                {getEpisodesForSelectedDate().length} 件の投稿
              </div>
            </div>

            <div className="hourly-timeline">
              {getEpisodesForSelectedDate().map((ep, index) => (
                <div key={ep.id} className="hourly-group">
                  <div className="hourly-time">{ep.time || "00:00"}</div>
                  <div className="hourly-marker"></div>
                  {index < getEpisodesForSelectedDate().length - 1 && (
                    <div className="hourly-line"></div>
                  )}

                  <div className="hourly-episodes">
                    <div className="hourly-episode-card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="episode-text">{ep.episode}</div>

                          {Object.keys(ep.parameters).some(
                            (key) => ep.parameters[key] !== 0
                          ) && (
                            <div className="episode-params">
                              {statConfigs.map(({ key, label, color }) => {
                                const value = ep.parameters[key];
                                if (value === 0) return null;
                                return (
                                  <div
                                    key={key}
                                    className="param-badge"
                                    style={{
                                      borderColor: color,
                                      color: color,
                                      background: `${color}08`,
                                    }}
                                  >
                                    {label}: {value > 0 ? "+" : ""}
                                    {value}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 編集・削除ボタン */}
                      <div className="detail-actions">
                        <button
                          className="detail-action-btn detail-edit-btn"
                          onClick={() => handleEditPost(ep)}
                        >
                          編集
                        </button>
                        <button
                          className="detail-action-btn detail-delete-btn"
                          onClick={() => handleDeletePost(ep)}
                        >
                          削除
                        </button>
                      </div>

                      {/* AIコメント表示 */}
                      {ep.aiComment && (
                        <div
                          style={{
                            marginTop: "0.8rem",
                            padding: "0.8rem",
                            background:
                              "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                            borderRadius: "6px",
                            borderLeft: "3px solid #00bcd4",
                            fontSize: "0.85rem",
                            color: "#555",
                            lineHeight: "1.5",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#00bcd4",
                              marginBottom: "0.3rem",
                              fontWeight: "600",
                            }}
                          >
                            💬 AIからのコメント
                          </div>
                          {ep.aiComment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="detail-view-container">
            <div className="detail-view-header">
              <div className="detail-view-date">
                {selectedDate.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </div>
            </div>
            <div className="no-episodes-message">
              <div className="no-episodes-icon">📅</div>
              <p>この日付には投稿がありません</p>
            </div>
          </div>
        )}
      </div>

      {/* フローティング投稿ボタン */}
      <button
        type="button"
        className="floating-button"
        onClick={() => setIsModalOpen(true)}
        title="エピソードを投稿"
      >
        +
      </button>

      {/* 投稿モーダル */}
      <PostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handlePostSubmit}
        lastParameters={lastParameters || stats}
        editData={editingPost}
      />

      {/* ボトムナビゲーション */}
      <BottomNavigation />
    </>
  );
}

export default ResourceCounter;
