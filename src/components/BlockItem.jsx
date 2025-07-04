import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BlockItem = ({ id, block, onChange, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block ${isDragging ? 'dragging' : ''}`}
    >
      <div className="block-header">
        <span className="drag-handle" {...attributes} {...listeners}>≡</span>
        <p>{block.type.toUpperCase()}</p>
        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete(id)}
        >
          ×
        </button>
      </div>
      <textarea
        value={block.content}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={`Enter ${block.type} content`}
      />
    </div>
  );
};

export default BlockItem;
