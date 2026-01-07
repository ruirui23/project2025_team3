import { useState, useEffect } from "react";
import { analyzeEpisodeParameters } from "../../services/gemini";

function PostModal({ isOpen, onClose, onSubmit, lastParameters, editData }) {
  const [episode, setEpisode] = useState("");
  const [parameters, setParameters] = useState({
    health: "",
    happiness: "",
    mentalState: "",
    hunger: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 編集モードの場合、データをセット
  useEffect(() => {
    if (editData) {
      setEpisode(editData.episode || "");
      setParameters({
        health: editData.parameters?.health?.toString() || "",
        happiness: editData.parameters?.happiness?.toString() || "",
        mentalState: editData.parameters?.mentalState?.toString() || "",
        hunger: editData.parameters?.hunger?.toString() || "",
      });
    } else {
      setEpisode("");
      setParameters({ health: "", happiness: "", mentalState: "", hunger: "" });
    }
  }, [editData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (episode.trim()) {
      const data = editData
        ? {
            ...editData,
            episode: episode.trim(),
            parameters: {
              health:
                parameters.health === "" || parameters.health === "-"
                  ? lastParameters?.health || 0
                  : Number(parameters.health),
              happiness:
                parameters.happiness === "" || parameters.happiness === "-"
                  ? lastParameters?.happiness || 0
                  : Number(parameters.happiness),
              mentalState:
                parameters.mentalState === "" || parameters.mentalState === "-"
                  ? lastParameters?.mentalState || 0
                  : Number(parameters.mentalState),
              hunger:
                parameters.hunger === "" || parameters.hunger === "-"
                  ? lastParameters?.hunger || 0
                  : Number(parameters.hunger),
            },
          }
        : {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            time: new Date().toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            episode: episode.trim(),
            parameters: {
              health:
                parameters.health === "" || parameters.health === "-"
                  ? lastParameters?.health || 0
                  : Number(parameters.health),
              happiness:
                parameters.happiness === "" || parameters.happiness === "-"
                  ? lastParameters?.happiness || 0
                  : Number(parameters.happiness),
              mentalState:
                parameters.mentalState === "" || parameters.mentalState === "-"
                  ? lastParameters?.mentalState || 0
                  : Number(parameters.mentalState),
              hunger:
                parameters.hunger === "" || parameters.hunger === "-"
                  ? lastParameters?.hunger || 0
                  : Number(parameters.hunger),
            },
          };
      onSubmit(data);
      // フォームをリセット
      setEpisode("");
      setParameters({ health: "", happiness: "", mentalState: "", hunger: "" });
      onClose();
    }
  };

  const handleParameterChange = (key, value) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAiAnalysis = async () => {
    if (!episode.trim()) {
      alert("まず「今日のできごと」を入力してください。");
      return;
    }

    setIsAnalyzing(true);
    try {
      const analyzedParams = await analyzeEpisodeParameters(episode);
      setParameters({
        health: analyzedParams.health.toString(),
        happiness: analyzedParams.happiness.toString(),
        mentalState: analyzedParams.mentalState.toString(),
        hunger: analyzedParams.hunger.toString(),
      });
    } catch (error) {
      alert(error.message || "エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const paramConfigs = [
    { key: "health", label: "健康", color: "#4CAF50" },
    { key: "happiness", label: "幸福度", color: "#FF9800" },
    { key: "mentalState", label: "精神状態", color: "#2196F3" },
    { key: "hunger", label: "満腹度", color: "#f44336" },
  ];

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #f5f5f5;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #e0e0e0;
          color: #333;
        }

        .modal-content h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #00bcd4;
        }

        .parameters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .parameter-item {
          display: flex;
          flex-direction: column;
        }

        .parameter-item label {
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .parameter-item input {
          padding: 0.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .parameter-item input:focus {
          outline: none;
          border-color: #00bcd4;
        }

        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          background: #00bcd4;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
        }

        .submit-btn:hover {
          background: #00acc1;
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .modal-body {
          color: #666;
          line-height: 1.6;
        }

        .parameter-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .ai-button {
          padding: 0.4rem 0.8rem;
          background: #757575;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .ai-button:hover:not(:disabled) {
          background: #616161;
        }

        .ai-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .ai-button:active:not(:disabled) {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 1.5rem;
          }
          
          .parameters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <h2>{editData ? "日記を編集" : "日記を投稿"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>今日のできごと</label>
              <textarea
                value={episode}
                onChange={(e) => setEpisode(e.target.value)}
                placeholder="今日あったことを書いてください..."
                required
              />
            </div>
            <div className="form-group">
              <div className="parameter-header">
                <button
                  type="button"
                  className="ai-button"
                  onClick={handleAiAnalysis}
                  disabled={isAnalyzing || !episode.trim()}
                >
                  {isAnalyzing ? "分析中..." : "AIによる独断"}
                </button>
                <label>パラメータ変化</label>
              </div>
              <div className="parameters-grid">
                {paramConfigs.map(({ key, label, color }) => (
                  <div key={key} className="parameter-item">
                    <label style={{ color }}>{label}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="-?[0-9]*"
                      value={parameters[key]}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 空文字、マイナス記号のみ、または数字を含む有効な値のみ許可
                        if (
                          value === "" ||
                          value === "-" ||
                          /^-?\d+$/.test(value)
                        ) {
                          handleParameterChange(key, value);
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={!episode.trim()}
            >
              {editData ? "更新する" : "投稿する"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PostModal;
