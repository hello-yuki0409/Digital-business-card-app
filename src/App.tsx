import { Routes, Route, Navigate } from "react-router-dom";
import { CardDetailPage } from "./components/pages/CardDetailPage.tsx";
import { CardRegisterPage } from "./components/pages/CardRegisterPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/cards/:id" element={<CardDetailPage />} />
      <Route path="/cards/register" element={<CardRegisterPage />} />
      <Route path="*" element={<Navigate to="/cards/sample_id" replace />} />
    </Routes>
  );
}
