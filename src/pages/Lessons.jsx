import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import LessonCard from '../components/LessonCard';
import '../styles/Lessons.css';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const querySnapshot = await getDocs(collection(db, 'lessons'));
      const lessonData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(lessonData);
    };

    fetchLessons();
  }, []);

  return (
    <div className="lessons-container">
      <h2>All Lessons</h2>
      <div className="lessons-grid">
        {lessons.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
};

export default Lessons;
