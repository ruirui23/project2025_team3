import { useState, useEffect } from "react";
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
  const [commentExpandedPostIds, setCommentExpandedPostIds] = useState(new Set());
  const [loadingCommentPostId, setLoadingCommentPostId] = useState(null);
  const [commentErrors, setCommentErrors] = useState({});
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
      const newStats = { ...prevStats, [statName]: prevStats[statName] + amount };
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
        const comment = await generateEncouragingComment(post.episode, post.parameters);
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
          [post.id]: error.message || "コメントの生成に失敗しました"
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
                      className="post-episode"
                      onClick={() => togglePostActions(ep.id)}
                      style={{
                        fontSize: "1rem",
                        color: "#333",
                        lineHeight: "1.6",
                      }}
                    >
                      {ep.episode}
                    </div>
                    {expandedPostId === ep.id && (
                      <div className="post-actions">
                        <button
                          className="post-action-btn edit-btn"
                          onClick={() => handleEditPost(ep)}
                        >
                          編集
                        </button>
                        <button
                          className="post-action-btn delete-btn"
                          onClick={() => handleDeletePost(ep)}
                        >
                          削除
                        </button>
                      </div>
                    )}
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

                {/* AIコメントセクション */}
                <div style={{ marginTop: "0.8rem", borderTop: "1px solid #f0f0f0", paddingTop: "0.8rem" }}>
                  <button
                    onClick={() => toggleAiComment(ep)}
                    disabled={loadingCommentPostId === ep.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "none",
                      border: "none",
                      color: "#757575",
                      fontSize: "0.85rem",
                      cursor: loadingCommentPostId === ep.id ? "not-allowed" : "pointer",
                      padding: "0.4rem",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (loadingCommentPostId !== ep.id) {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.03)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    <span style={{
                      transform: commentExpandedPostIds.has(ep.id) ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}>
                      ▽
                    </span>
                    <span>
                      {loadingCommentPostId === ep.id
                        ? "コメント生成中..."
                        : ep.aiComment
                          ? "AIコメント"
                          : "AIコメントを見る"}
                    </span>
                  </button>

                  {commentExpandedPostIds.has(ep.id) && ep.aiComment && (
                    <div
                      style={{
                        marginTop: "0.8rem",
                        padding: "1rem",
                        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        borderRadius: "8px",
                        borderLeft: "3px solid #00bcd4",
                        animation: "slideDown 0.3s ease-out",
                      }}
                    >
                      <div style={{
                        fontSize: "0.75rem",
                        color: "#757575",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}>
                        AIからのコメント
                      </div>
                      <div style={{
                        fontSize: "0.95rem",
                        color: "#333",
                        lineHeight: "1.6",
                      }}>
                        {ep.aiComment}
                      </div>
                    </div>
                  )}

                  {commentErrors[ep.id] && (
                    <div
                      style={{
                        marginTop: "0.8rem",
                        padding: "0.8rem",
                        background: "#ffebee",
                        borderRadius: "6px",
                        borderLeft: "3px solid #f44336",
                        fontSize: "0.85rem",
                        color: "#c62828",
                      }}
                    >
                      {commentErrors[ep.id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
