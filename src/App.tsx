import { ChakraProvider } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import CardDetailPage from "./components/pages/CardDetailPage.tsx";

export default function App() {
  return (
    <ChakraProvider>
      <Routes>
        <Route path="/cards/:id" element={<CardDetailPage />} />
        <Route path="*" element={<Navigate to="/cards/sample_id" replace />} />
      </Routes>
    </ChakraProvider>
  );
}
