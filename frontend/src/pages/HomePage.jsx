import { useEffect, useRef, useState } from "react";
import styles from "../styles/HomePage.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const HomePage = ({ news }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [newsPerPage, setNewsPerPage] = useState(3); // You can make this dynamic based on screen size

  const totalPages = Math.ceil(news.length / newsPerPage);

  // Scroll to a specific page
  const scrollToPage = (index) => {
    const container = containerRef.current;
    if (!container) return;
    const scrollWidth = container.offsetWidth;
    container.scrollTo({ left: scrollWidth * index, behavior: "smooth" });
    setActiveIndex(index);
  };

  // Navigation buttons
  const scrollLeft = () => {
    if (activeIndex > 0) scrollToPage(activeIndex - 1);
  };

  const scrollRight = () => {
    if (activeIndex < totalPages - 1) scrollToPage(activeIndex + 1);
  };

  return (
    <div className={styles.homePage}>
      <h1>Today's Top News</h1>
      <br />

      <div className={styles.scrollingContainer}>
        <button
          className={styles.scrollBtn}
          onClick={scrollLeft}
          disabled={activeIndex === 0}
        >
          <FaChevronLeft />
        </button>

        <div
          className={styles.newsContainer}
          ref={containerRef}
        >
          {news.length ? (
            news.map((article, index) => (
              <div key={index} className={styles.newsCard}>
                <img
                  src={article.image}
                  alt="News"
                  className={styles.newsImage}
                />
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  🔗 Read more
                </a>
              </div>
            ))
          ) : (
            <p>Loading latest news...</p>
          )}
        </div>

        <button
          className={styles.scrollBtn}
          onClick={scrollRight}
          disabled={activeIndex === totalPages - 1}
        >
          <FaChevronRight />
        </button>
      </div>

      <div className={styles.paginationDots}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <span
            key={index}
            className={
              index === activeIndex ? styles.activeDot : styles.dot
            }
            onClick={() => scrollToPage(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
