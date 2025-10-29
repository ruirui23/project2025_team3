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
      <div style={{ paddingBottom: "60px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>自己管理</h1>
                <ResourceCounter />
                <p className="read-the-docs">
                  Click on the Vite and React logos to learn more
                </p>
              </>
            }
          />
          <Route path="/tweet" element={<Tweet />} />
          <Route path="/game1" element={<Game1 />} />
          <Route path="/game2" element={<Game2 />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
