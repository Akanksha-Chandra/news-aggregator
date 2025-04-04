import React, { useState } from "react";
import styles from "../styles/SearchPage.module.css";

const categories = [
  ["Society", "Government", "Politics", "Law", "Crime", "Law Enforcement"],
  ["Business", "Finance", "Economics", "Marketing", "Real Estate"],
  ["Technology", "Science", "Engineering", "Aviation", "Energy"],
  ["Sports", "Video Games", "Gaming", "Transportation"],
  ["Culture", "Fashion", "Lifestyle", "Entertainment", "Television", "Music", "Film"],
  ["Health", "Healthcare", "Medicine", "Psychology", "Parenting"],
  ["Environment", "Nature", "Geography", "Animals", "Weather"],
];

const SearchPage = ({ onSearch, news = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSearch = () => {
    const query = selectedCategory ? `${searchQuery} ${selectedCategory}` : searchQuery;
    onSearch(query);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setSearchQuery(""); // Reset search input on category click
    onSearch(category); // Trigger search based on category
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
          placeholder="Search for news..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown} // Trigger search on Enter key
        />
        <button className={styles.searchButton} onClick={handleSearch}>
          Search
        </button>
      </div>

      <h2>Categories</h2>
      <div className={styles.categories}>
        {categories.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.categoryRow}>
            {row.map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${
                  selectedCategory === category ? styles.selected : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.newsResults}>
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className={styles.newsCard}>
              {article.image && (
                <img src={article.image} alt="News" className={styles.newsImage} />
              )}
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read more
              </a>
            </div>
          ))
        ) : (
          <p>No news found. Try searching with a different query or select a category.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
