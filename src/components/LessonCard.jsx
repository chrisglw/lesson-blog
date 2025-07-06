import { useNavigate } from 'react-router-dom';

const LessonCard = ({ lesson }) => {
  const navigate = useNavigate();

  return (
    <div className="lesson-card" onClick={() => navigate(`/lesson/${lesson.id}`)}>
      <h3>{lesson.title}</h3>
      <p>{lesson.category}</p>
      {lesson.difficulty && <p>Difficulty: {lesson.difficulty}</p>}
    </div>
  );
};

export default LessonCard;
