import { useState, useEffect } from "react";
// import {
//   initializeDatabase,
//   getAllDataFromDB,
//   updatePostInDB,
//   deletePostFromDB,
//   updatePostCommentInDB,
// } from "../../database/index_db";
// import BottomNavigation from "../common/BottomNavigation";
// import { modifyData } from "../../services/data";
import { generateEncouragingComment } from "../services/gemini";

function Game1() {
  const [episodes, setEpisodes] = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentExpandedPostIds, setCommentExpandedPostIds] = useState(
    new Set()
  );
  const [loadingCommentPostId, setLoadingCommentPostId] = useState(null);
  const [commentErrors, setCommentErrors] = useState({});

  const statConfigs = [
    { key: "health", label: "体力", color: "#4CAF50", initialValue: 100 },
    { key: "stress", label: "ストレス", color: "#f44336", initialValue: 0 },
    { key: "energy", label: "空腹度", color: "#FF9800", initialValue: 50 },
    { key: "money", label: "お金", color: "#2196F3", initialValue: 1000 },
  ];

  const handleDeletePost = async (post) => {
    if (window.confirm("この投稿を削除しますか？")) {
      try {
        await deletePostFromDB(post.id);
        // エピソードリストから削除
        setEpisodes(episodes.filter((ep) => ep.id !== post.id));
      } catch (error) {
        console.error("データ削除エラー:", error);
      }
    }
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

  return (
    <>
      <style>{`
        .game1-container {
          margin-top: 100px;
          padding-bottom: 80px;
        }

        .timeline-header {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .timeline-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .timeline-subtitle {
          font-size: 0.95rem;
          color: #666;
          margin-top: 0.5rem;
        }

        .resource-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          color: #333;
        }

        .resource-container h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #333;
          text-align: left;
        }

        .timeline-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.2rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .timeline-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .timeline-item-content {
          flex: 1;
        }

        .timeline-datetime {
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 0.5rem;
        }

        .timeline-text {
          cursor: pointer;
          transition: background 0.2s;
          padding: 0.5rem;
          border-radius: 6px;
          margin: -0.5rem;
          font-size: 1rem;
          color: #333;
          line-height: 1.6;
        }

        .timeline-text:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .timeline-actions {
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

        .action-btn {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-btn {
          background: #f44336;
          color: white;
        }

        .delete-btn:hover {
          background: #d32f2f;
        }

        .timeline-params {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 80px;
          align-items: flex-end;
        }

        .param-value {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .ai-comment-section {
          margin-top: 0.8rem;
          border-top: 1px solid #f0f0f0;
          padding-top: 0.8rem;
        }

        .ai-comment-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #757575;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .ai-comment-btn:disabled {
          cursor: not-allowed;
        }

        .ai-comment-btn:not(:disabled):hover {
          background: rgba(0, 0, 0, 0.03);
        }

        .ai-comment-arrow {
          display: inline-block;
          transition: transform 0.2s;
        }

        .ai-comment-content {
          margin-top: 0.8rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border-left: 3px solid #00bcd4;
          animation: slideDown 0.3s ease-out;
        }

        .ai-comment-label {
          font-size: 0.75rem;
          color: #757575;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .ai-comment-text {
          font-size: 0.95rem;
          color: #333;
          line-height: 1.6;
        }

        .error-message {
          margin-top: 0.8rem;
          padding: 0.8rem;
          background: #ffebee;
          border-radius: 6px;
          border-left: 3px solid #f44336;
          font-size: 0.85rem;
          color: #c62828;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #999;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* レスポンシブデザイン */
        @media (max-width: 768px) {
          .game1-container {
            margin-top: 80px;
          }

          .timeline-header {
            margin: 1.5rem;
            padding: 1.5rem;
          }

          .timeline-title {
            font-size: 1.2rem;
          }

          .resource-container {
            margin: 1.5rem;
            padding: 1.5rem;
          }

          .timeline-item-header {
            flex-direction: column;
          }

          .timeline-params {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .resource-container {
            padding: 1rem;
            margin: 1rem;
          }

          .timeline-item {
            padding: 1rem;
          }

          .timeline-datetime {
            font-size: 0.8rem;
          }

          .timeline-text {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="game1-container">
        <div className="timeline-header">
          <h1 className="timeline-title">📔 日記タイムライン</h1>
          <p className="timeline-subtitle">
            {episodes.length} 件の投稿を表示しています
          </p>
        </div>

        {episodes.length > 0 ? (
          <div className="resource-container">
            <h3>全投稿履歴</h3>
            {episodes.map((ep) => (
              <div key={ep.id} className="timeline-item">
                <div className="timeline-item-header">
                  <div className="timeline-item-content">
                    <div className="timeline-datetime">
                      {ep.date} {ep.time}
                    </div>
                    <div
                      className="timeline-text"
                      onClick={() => togglePostActions(ep.id)}
                    >
                      {ep.episode}
                    </div>
                    {expandedPostId === ep.id && (
                      <div className="timeline-actions">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeletePost(ep)}
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="timeline-params">
                    {statConfigs.map(({ key, label, color }) => {
                      const value = ep.parameters[key];
                      if (value === 0) return null;
                      return (
                        <div
                          key={key}
                          className="param-value"
                          style={{ color }}
                        >
                          {value > 0 ? "+" : ""}
                          {value}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AIコメントセクション */}
                <div className="ai-comment-section">
                  <button
                    onClick={() => toggleAiComment(ep)}
                    disabled={loadingCommentPostId === ep.id}
                    className="ai-comment-btn"
                  >
                    <span
                      className="ai-comment-arrow"
                      style={{
                        transform: commentExpandedPostIds.has(ep.id)
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
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
                    <div className="ai-comment-content">
                      <div className="ai-comment-label">AIからのコメント</div>
                      <div className="ai-comment-text">{ep.aiComment}</div>
                    </div>
                  )}

                  {commentErrors[ep.id] && (
                    <div className="error-message">{commentErrors[ep.id]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="resource-container">
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>投稿がまだありません</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Game1;
