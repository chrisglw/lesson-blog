import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessonsWithMetadata = async () => {
      try {
        // Fetch all lessons, categories, and difficulties
        const lessonsSnap = await getDocs(collection(db, 'lessons'));
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        const difficultiesSnap = await getDocs(collection(db, 'difficulties'));

        // Map category IDs to names
        const categoriesMap = {};
        categoriesSnap.forEach((doc) => {
          categoriesMap[doc.id] = doc.data().name;
        });

        // Map difficulty IDs to names
        const difficultiesMap = {};
        difficultiesSnap.forEach((doc) => {
          difficultiesMap[doc.id] = doc.data().name;
        });

        // Combine metadata into lessons
        const lessonData = lessonsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            category: categoriesMap[data.categoryID] || 'Unknown',
            difficulty: data.difficultyID
              ? difficultiesMap[data.difficultyID] || 'Unknown'
              : null,
          };
        });

        setLessons(lessonData);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    };

    fetchLessonsWithMetadata();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      await deleteDoc(doc(db, 'lessons', id));
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
    }
  };

  const toggleVisibility = async (id, currentVisible) => {
    await updateDoc(doc(db, 'lessons', id), { visible: !currentVisible });
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id ? { ...lesson, visible: !currentVisible } : lesson
      )
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <button
        className="create-lesson-btn"
        onClick={() => navigate('/create-lesson')}
      >
        + Create New Lesson
      </button>

      <div className="dashboard-lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="dashboard-lesson-card">
            <h3>{lesson.title}</h3>
            <p>
              <strong>Category:</strong> {lesson.category}
            </p>
            {lesson.difficulty && (
              <p>
                <strong>Difficulty:</strong> {lesson.difficulty}
              </p>
            )}
            <p>
              <strong>Status:</strong>{' '}
              {lesson.visible ? 'Visible' : 'Hidden'}
            </p>

            <div className="dashboard-card-actions">
              <button onClick={() => navigate(`/lesson/${lesson.id}`)}>
                View
              </button>
              <button onClick={() => navigate(`/edit-lesson/${lesson.id}`)}>
                Edit
              </button>
              <button
                onClick={() => toggleVisibility(lesson.id, lesson.visible)}
              >
                {lesson.visible ? 'Hide' : 'Unhide'}
              </button>
              <button
                className="delete"
                onClick={() => handleDelete(lesson.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
