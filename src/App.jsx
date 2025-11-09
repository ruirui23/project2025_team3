
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ResourceCounter from "./components/Home/ResourceCounter";
import BottomNavigation from "./components/common/BottomNavigation";

function Tweet() {
  return <h2>Tweet Page</h2>;
}
function Game1() {
  return <h2>Game1 Page</h2>;
}
function Game2() {
  return <h2>Game2 Page</h2>;
}
function Profile() {
  return <h2>Profile Page</h2>;
}


function App() {
  return (
    <BrowserRouter>
      <style>{`
        .app-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 999;
        }

        .app-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          text-align: center;
        }

        .app-main {
          margin-top: 70px;
          padding-bottom: 80px;
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 0.8rem 1rem;
          }

          .app-header h1 {
            font-size: 1.2rem;
          }

          .app-main {
            margin-top: 60px;
          }
        }
      `}</style>

      {/* 固定ヘッダー */}
      <div className="app-header">
        <h1>自己管理</h1>
      </div>

      <div className="app-main">
        <Routes>
          <Route path="/" element={<ResourceCounter />} />
          <Route path="/tweet" element={<Tweet />} />
          <Route path="/game1" element={<Game1 />} />
          <Route path="/game2" element={<Game2 />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      <BottomNavigation />
    </BrowserRouter>
  );
}

export default App;
