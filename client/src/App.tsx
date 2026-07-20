import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoomProvider } from "./hooks/useRoom";
import { HomePage } from "./pages/HomePage";
import { LobbyPage } from "./pages/LobbyPage";
import { GamePage } from "./pages/GamePage";
import { ResultsPage } from "./pages/ResultsPage";
import "./styles.css";

export default function App() {
  return (
    <RoomProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join/:roomCode" element={<HomePage />} />
          <Route path="/lobby/:roomCode" element={<LobbyPage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
          <Route path="/results/:roomCode" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </RoomProvider>
  );
}
