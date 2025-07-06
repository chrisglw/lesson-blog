import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/LessonDetail.css';

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      const docRef = doc(db, 'lessons', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLesson(docSnap.data());
      }
    };
    fetchLesson();
  }, [id]);

  if (!lesson) return <p className="lesson-loading">Loading...</p>;

  return (
    <div className="lesson-detail">
      <h1 className="lesson-title">{lesson.title}</h1>
      <p className="lesson-meta">
        <strong>Category:</strong> {lesson.category}
        {lesson.difficulty && (
          <>
            &nbsp;|&nbsp;
            <strong>Difficulty:</strong> {lesson.difficulty}
          </>
        )}
      </p>

      <div className="lesson-blocks">
        {lesson.blocks.map((block, idx) => {
          if (!block.content?.trim()) return null;

          switch (block.type) {
            case 'subtitle':
              return <h2 key={idx} className="lesson-subtitle">{block.content}</h2>;
            case 'paragraph':
              return <p key={idx} className="lesson-paragraph">{block.content}</p>;
            case 'code':
              return (
                <pre key={idx} className="lesson-code">
                  <code>{block.content}</code>
                </pre>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default LessonDetail;