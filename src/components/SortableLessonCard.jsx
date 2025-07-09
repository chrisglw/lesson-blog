import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableLessonCard = ({ lesson, onView, onEdit, onToggle, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`dashboard-lesson-card ${isDragging ? 'dragging' : ''}`}
    >
      {/* Header with title on the left and handle on the right */}
      <div className="lesson-card-header">
        <h3>{lesson.title}</h3>
        <span className="drag-handle" {...attributes} {...listeners}>≡</span>
      </div>

      <p><strong>Category:</strong> {lesson.category}</p>
      {lesson.difficulty && <p><strong>Difficulty:</strong> {lesson.difficulty}</p>}
      <p><strong>Status:</strong> {lesson.visible ? 'Visible' : 'Hidden'}</p>

      <div className="dashboard-card-actions">
        <button onClick={onView}>View</button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onToggle}>{lesson.visible ? 'Hide' : 'Unhide'}</button>
        <button className="delete" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default SortableLessonCard;
