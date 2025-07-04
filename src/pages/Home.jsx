import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="intro-section">
        <h1>Welcome to my Learning Site</h1>
        <p>
          A place to document my problem-solving journey, share lessons from LeetCode and other coding challenges,
          and help others learn through my experiences.
        </p>
        <Link to="/lessons" className="cta-button">
          Start Learning
        </Link>
      </div>
    </div>
  );
};

export default Home;
