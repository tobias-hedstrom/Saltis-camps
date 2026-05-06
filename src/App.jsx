import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppDataProvider } from "./context/AppDataContext";
import { useAppData } from "./hooks/useAppData";
import Header from "./components/Header";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Camps from "./pages/Camps";
import CampDetail from "./pages/CampDetail";
import MyPage from "./pages/MyPage";
import Admin from "./pages/Admin";
import "./styles/index.css";

function AppRoutes() {
  const { canManageCamps } = useAppData();

  return (
    <>
      <Header />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:newsId" element={<NewsDetail />} />
          <Route path="/camps" element={<Camps />} />
          <Route path="/camps/:id" element={<CampDetail />} />
          <Route path="/my-page" element={<MyPage />} />
          {canManageCamps ? (
            <Route path="/admin" element={<Admin />} />
          ) : (
            <Route path="/admin" element={<Navigate to="/" />} />
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppDataProvider>
  );
}
