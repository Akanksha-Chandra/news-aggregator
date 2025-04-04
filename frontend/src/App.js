import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import styles from "./styles/App.module.css";
import { useEffect, useState } from "react";

const App = () => {
  const [homeNews, setHomeNews] = useState([]);  // State for top news
  const [searchNews, setSearchNews] = useState([]);  // State for search results

  // Fetch top/latest news for HomePage
  const fetchHomeNews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get_news`);
      const data = await response.json();
      setHomeNews(data);
    } catch (error) {
      console.error("Error fetching home news:", error);
    }
  };

  // Fetch news based on search query
  const fetchSearchNews = async (query = "") => {
    try {
      const response = await fetch(`http://localhost:5000/get_news?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchNews(data);
    } catch (error) {
      console.error("Error fetching search news:", error);
    }
  };

  useEffect(() => {
    fetchHomeNews();  // Load top news on HomePage mount
  }, []);

  return (
    <Router>
      <div className={styles.appContainer}>
        <Navbar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<HomePage news={homeNews} />} />
            <Route path="/search" element={<SearchPage onSearch={fetchSearchNews} news={searchNews} />} />
            <Route path="/news/:id" element={<NewsDetailPage news={homeNews} />} />
            <Route path="/help" element={<HelpSupportPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
