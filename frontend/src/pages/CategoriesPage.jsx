import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/CategoriesPage.module.css";

// Categories from backend with subcategories
const categoryGroups = [
  {
    name: "Sports",
    subcategories: ["Football", "Cricket", "Basketball", "Tennis", "Hockey"]
  },
  {
    name: "Technology",
    subcategories: ["AI", "Tech", "Machine Learning", "Gadgets"]
  },
  {
    name: "Health",
    subcategories: ["Health", "Medicine", "Fitness", "Wellness"]
  },
  {
    name: "Business",
    subcategories: ["Business", "Finance", "Economy", "Market"]
  },
  {
    name: "Entertainment",
    subcategories: ["Movies", "Music", "Celebrity", "TV"]
  },
  {
    name: "Society",
    subcategories: ["Government", "Politics", "Law", "Crime", "Law Enforcement"]
  },
  {
    name: "Environment",
    subcategories: ["Nature", "Geography", "Animals", "Weather"]
  }
];

const CategoriesPage = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch news based on category or subcategory
  const fetchNews = async (query) => {
    if (!query) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/get_news?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(`Failed to fetch news: ${error.message}`);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle main category selection
  const handleCategoryClick = (category) => {
    // If clicking the same category, toggle it off
    if (category === activeCategory) {
      setActiveCategory("");
      setActiveSubcategory("");
      setNews([]);
    } else {
      setActiveCategory(category);
      setActiveSubcategory("");
      fetchNews(category);
    }
  };

  // Handle subcategory selection
  const handleSubcategoryClick = (subcategory) => {
    // If clicking the same subcategory, toggle it off
    if (subcategory === activeSubcategory) {
      setActiveSubcategory("");
      // Fetch news for main category instead
      if (activeCategory) {
        fetchNews(activeCategory);
      }
    } else {
      setActiveSubcategory(subcategory);
      fetchNews(subcategory);
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>News Categories</h1>
      
      <div className={styles.categoryNavigation}>
        {categoryGroups.map((group) => (
          <div key={group.name} className={styles.categoryGroup}>
            <button
              className={`${styles.categoryButton} ${activeCategory === group.name ? styles.active : ""}`}
              onClick={() => handleCategoryClick(group.name)}
            >
              {group.name}
            </button>
            
            {activeCategory === group.name && (
              <div className={styles.subcategories}>
                {group.subcategories.map((sub) => (
                  <button
                    key={sub}
                    className={`${styles.subcategoryButton} ${activeSubcategory === sub ? styles.active : ""}`}
                    onClick={() => handleSubcategoryClick(sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.newsContent}>
        {activeCategory && (
          <h2 className={styles.categoryHeading}>
            {activeSubcategory ? activeSubcategory : activeCategory} News
          </h2>
        )}
        
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <p>Loading news articles...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        ) : news.length > 0 ? (
          <div className={styles.newsGrid}>
            {news.map((article, index) => (
              <div key={index} className={styles.newsCard}>
                {article.image && (
                  <div className={styles.imageContainer}>
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className={styles.newsImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x200?text=News";
                      }}
                    />
                  </div>
                )}
                <div className={styles.newsCardContent}>
                  <h3 className={styles.newsTitle}>{article.title}</h3>
                  <p className={styles.newsDate}>{formatDate(article.published_at)}</p>
                  <p className={styles.newsDescription}>{article.description}</p>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.readMoreLink}
                  >
                    Read More
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : activeCategory ? (
          <div className={styles.noResults}>
            <p>No news articles found for {activeSubcategory || activeCategory}.</p>
            <p>Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <div className={styles.instructionsContainer}>
            <p>Select a category from above to browse news articles.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;