import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import BlockItem from '../components/BlockItem';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState('');
  const [visible, setVisible] = useState(true);
  const [blocks, setBlocks] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleAddBlock = (type) => {
    setBlocks([...blocks, { id: Date.now().toString(), type, content: '' }]);
  };

  const handleBlockChange = (id, content) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    );
  };

  const handleDeleteBlock = (id) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    setBlocks((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !order) {
      alert('Please fill all required fields.');
      return;
    }

    await addDoc(collection(db, 'lessons'), {
      title,
      category,
      order: parseInt(order),
      visible,
      blocks,
      timestamp: Timestamp.now(),
    });

    alert('Lesson created!');

    // Reset inputs after slight delay to avoid browser "required" bug
    setTimeout(() => {
      setTitle('');
      setCategory('');
      setOrder('');
      setVisible(true);
      setBlocks([]);
    }, 100);
  };

  return (
    <div className="dashboard">
      <h2>Create a New Lesson</h2>
      <form onSubmit={handleSubmit} className="lesson-form">
        <input
          type="text"
          placeholder="Lesson Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category (e.g., Arrays)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          required
        />

        <div className="toggle-container">
          <span>Visible:</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={visible}
              onChange={() => setVisible(!visible)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="blocks-section">
          <h3>Lesson Blocks</h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <BlockItem
                  key={block.id}
                  id={block.id}
                  block={block}
                  onChange={handleBlockChange}
                  onDelete={handleDeleteBlock}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="block-buttons">
            <button type="button" onClick={() => handleAddBlock('subtitle')}>+ Subtitle</button>
            <button type="button" onClick={() => handleAddBlock('paragraph')}>+ Paragraph</button>
            <button type="button" onClick={() => handleAddBlock('code')}>+ Code</button>
          </div>
        </div>

        <button type="submit">Save Lesson</button>
      </form>
    </div>
  );
};

export default Dashboard;
