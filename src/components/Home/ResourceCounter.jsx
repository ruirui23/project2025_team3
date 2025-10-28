import { useState, useEffect } from 'react';
import './ResourceCounter.css';
import { getParameters, modifyData } from '../../services/data';

function ResourceCounter() {
  const [stats, setStats] = useState({
    health: 100,      // 体力
    stress: 0,         // ストレス
    energy: 50,        // エネルギー（ご飯）
    money: 1000        // お金
  });

  useEffect(() => {
    getParameters().then(data => {
      if (data) setStats(data);
    }).catch(() => {});
  }, []);

  const updateStat = (statName, amount) => {
    setStats(prevStats => {
      const newValue = Math.max(0, prevStats[statName] + amount);
      modifyData(statName, amount).catch(() => {});
      return { ...prevStats, [statName]: newValue };
    });
  };

  const statConfigs = [
    { key: 'health', label: '体力', color: '#4CAF50', initialValue: 100 },
    { key: 'stress', label: 'ストレス', color: '#f44336', initialValue: 0 },
    { key: 'energy', label: '空腹度', color: '#FF9800', initialValue: 50 },
    { key: 'money', label: 'お金', color: '#2196F3', initialValue: 1000 }
  ];

  return (
    <div className="resource-container">
      <h2>ステータス</h2>
      <div className="resource-grid">
        {statConfigs.map(({ key, label, color, initialValue }) => (
          <div key={key} className="resource-card" style={{ borderColor: color }}>
            <h3 className="resource-label" style={{ color }}>{label}</h3>
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
                style={{ backgroundColor: '#666' }}
              >
                -1
              </button>
              <button 
                className="resource-btn decrement-btn" 
                onClick={() => updateStat(key, -10)}
                style={{ backgroundColor: '#666' }}
              >
                -10
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourceCounter;

