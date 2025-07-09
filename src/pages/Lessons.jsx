import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import LessonCard from '../components/LessonCard';
import '../styles/Lessons.css';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const lessonsSnap = await getDocs(
        query(collection(db, 'lessons'), where('visible', '==', true), orderBy('order'))
      );
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const difficultiesSnap = await getDocs(collection(db, 'difficulties'));

      // Normalize category and difficulty maps
      const categoriesMap = {};
      categoriesSnap.forEach((doc) => {
        categoriesMap[doc.id] = doc.data().name;
      });

      const difficultiesMap = {};
      difficultiesSnap.forEach((doc) => {
        difficultiesMap[doc.id] = doc.data().name;
      });

      // Combine lessons with normalized metadata
      const lessonData = lessonsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          category: categoriesMap[data.categoryID] || 'Unknown',
          difficulty: data.difficultyID ? difficultiesMap[data.difficultyID] || 'Unknown' : null,
        };
      });

      setLessons(lessonData);
    };

    fetchLessons();
  }, []);

  return (
    <div className="lessons-container">
      <h2>All Lessons</h2>
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
};

export default Lessons;
