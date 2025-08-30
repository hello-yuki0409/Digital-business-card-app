import { Routes, Route, Navigate } from "react-router-dom";
import { CardDetailPage } from "./components/pages/CardDetailPage.tsx";
import { CardRegisterPage } from "./components/pages/CardRegisterPage.tsx";
import { HomePage } from "./components/pages/HomePage.tsx";

export default function App() {
  return (
    <Routes>
      {/* 名刺詳細は id 必須！！ */}
      <Route path="/cards/:id" element={<CardDetailPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/cards/register" element={<CardRegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
