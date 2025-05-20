import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import CategoriesPage from "./pages/CategoriesPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import Timeline from "./pages/Timeline";
import Chatbot from "./pages/Chatbot";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import styles from "./styles/App.module.css";

const AppContent = () => {
  const { getNews } = useAuth();
  const [homeNews, setHomeNews] = useState([]);
  const [searchNews, setSearchNews] = useState([]);

  const fetchHomeNews = async () => {
    try {
      const data = await getNews();
      setHomeNews(data);
    } catch (error) {
      console.error("Error fetching home news:", error);
    }
  };

  const fetchSearchNews = async (query = "") => {
    try {
      const data = await getNews(query);
      setSearchNews(data);
    } catch (error) {
      console.error("Error fetching search news:", error);
    }
  };

  useEffect(() => {
    fetchHomeNews();
  }, []);

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<HomePage news={homeNews} />} />
          <Route path="/search" element={<SearchPage onSearch={fetchSearchNews} news={searchNews} />} />
          <Route path="/news/:id" element={<NewsDetailPage news={homeNews} />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/ask-newsbot" element={<Chatbot />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;