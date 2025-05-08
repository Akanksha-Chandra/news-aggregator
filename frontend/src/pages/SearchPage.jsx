import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/SearchPage.module.css";

const SearchPage = ({ onSearch, news = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Perform search when component mounts with empty query to show initial results
  useEffect(() => {
    if (onSearch && news.length === 0) {
      onSearch("");
    }
  }, [onSearch, news.length]);

  const handleSearch = () => {
    if (searchQuery.trim() || searchQuery === "") {
      setIsLoading(true);
      onSearch(searchQuery).finally(() => setIsLoading(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className={styles.container}>
      <h1>Search News</h1>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search for news by keywords..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className={styles.searchButton} 
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      <p className={styles.resultsCount}>
        {news.length > 0 ? `Found ${news.length} results` : "No results found"}
      </p>

      <div className={styles.newsResults}>
        {isLoading ? (
          <p>Loading results...</p>
        ) : news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className={styles.newsCard}>
              {article.image && (
                <img src={article.image} alt={article.title} className={styles.newsImage} />
              )}
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              {article.id ? (
                <Link to={`/news/${article.id}`} className={styles.readMoreLink}>
                  Read more
                </Link>
              ) : (
                <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.readMoreLink}>
                  Read more
                </a>
              )}
            </div>
          ))
        ) : (
          <p>Try searching for topics like "Technology", "Sports", or "Politics"</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;