import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableLessonCard from '../components/SortableLessonCard';

import '../styles/Dashboard.css';

const Dashboard = () => {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchLessonsWithMetadata = async () => {
      try {
        const lessonsSnap = await getDocs(query(collection(db, 'lessons'), orderBy('order')));
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        const difficultiesSnap = await getDocs(collection(db, 'difficulties'));

        const categoriesMap = {};
        categoriesSnap.forEach((doc) => {
          categoriesMap[doc.id] = doc.data().name;
        });

        const difficultiesMap = {};
        difficultiesSnap.forEach((doc) => {
          difficultiesMap[doc.id] = doc.data().name;
        });

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
    const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);

    const newLessons = arrayMove(lessons, oldIndex, newIndex);
    setLessons(newLessons);

    // Update order in Firestore
    const batch = writeBatch(db);
    newLessons.forEach((lesson, index) => {
      const ref = doc(db, 'lessons', lesson.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <button className="create-lesson-btn" onClick={() => navigate('/create-lesson')}>
        + Create New Lesson
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="dashboard-lessons-grid">
            {lessons.map((lesson) => (
              <SortableLessonCard
                key={lesson.id}
                lesson={lesson}
                onView={() => navigate(`/lesson/${lesson.id}`)}
                onEdit={() => navigate(`/edit-lesson/${lesson.id}`)}
                onToggle={() => toggleVisibility(lesson.id, lesson.visible)}
                onDelete={() => handleDelete(lesson.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Dashboard;
