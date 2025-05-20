import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/ProfilePage.module.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [favoriteNews, setFavoriteNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Example: Fetch user's favorite news
    // In a real app, this would connect to your backend API
    const fetchFavorites = async () => {
      try {
        // Simulating API call with timeout
        setTimeout(() => {
          // Mock data - in a real app, you'd fetch from your API
          setFavoriteNews([
            { id: 1, title: 'Example Favorite News 1', date: '2025-05-01' },
            { id: 2, title: 'Example Favorite News 2', date: '2025-05-02' },
            { id: 3, title: 'Example Favorite News 3', date: '2025-05-03' },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>User Profile</h1>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileInfo}>
          <h2>{user.username}</h2>
          <p>Email: {user.email}</p>
          <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h2>Your Favorite News</h2>
      </div>

      {isLoading ? (
        <div className={styles.loadingIndicator}>Loading favorites...</div>
      ) : favoriteNews.length > 0 ? (
        <div className={styles.favoritesList}>
          {favoriteNews.map(item => (
            <div key={item.id} className={styles.favoriteItem}>
              <h3>{item.title}</h3>
              <p>Saved on: {item.date}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noFavorites}>You haven't saved any news articles yet.</p>
      )}
    </div>
  );
};

export default ProfilePage;