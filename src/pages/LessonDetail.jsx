import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/LessonDetail.css';

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [difficultyName, setDifficultyName] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      const docRef = doc(db, 'lessons', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setLesson(data);

        // Fetch category name
        if (data.categoryID) {
          const catRef = doc(db, 'categories', data.categoryID);
          const catSnap = await getDoc(catRef);
          if (catSnap.exists()) {
            setCategoryName(catSnap.data().name);
          } else {
            setCategoryName('Unknown');
          }
        }

        // Fetch difficulty name (optional)
        if (data.difficultyID) {
          const diffRef = doc(db, 'difficulties', data.difficultyID);
          const diffSnap = await getDoc(diffRef);
          if (diffSnap.exists()) {
            setDifficultyName(diffSnap.data().name);
          } else {
            setDifficultyName('Unknown');
          }
        }
      }
    };

    fetchLesson();
  }, [id]);

  if (!lesson) return <p className="lesson-loading">Loading...</p>;

  return (
    <div className="lesson-detail">
      <h1 className="lesson-title">{lesson.title}</h1>
      <p className="lesson-meta">
        <strong>Category:</strong> {categoryName}
        {lesson.difficultyID && (
          <>
            &nbsp;|&nbsp;
            <strong>Difficulty:</strong> {difficultyName}
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
