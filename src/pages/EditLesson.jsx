import { useEffect, useState, useRef } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
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
import '../styles/CreateLesson.css';

const EditLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [difficultyInput, setDifficultyInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [visible, setVisible] = useState(true);
  const [blocks, setBlocks] = useState([]);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const difficultyDropdownRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchInitialData = async () => {
      const docSnap = await getDoc(doc(db, 'lessons', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title);
        setVisible(data.visible);
        setBlocks(data.blocks || []);

        const catSnap = await getDocs(collection(db, 'categories'));
        const diffSnap = await getDocs(collection(db, 'difficulties'));

        const cats = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const diffs = diffSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setCategories(cats);
        setDifficulties(diffs);

        const category = cats.find((c) => c.id === data.categoryID);
        if (category) setCategoryInput(category.name);

        if (data.difficultyID) {
          const difficulty = diffs.find((d) => d.id === data.difficultyID);
          if (difficulty) setDifficultyInput(difficulty.name);
        }
      }
    };
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!categoryDropdownRef.current?.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
      if (!difficultyDropdownRef.current?.contains(e.target)) {
        setDifficultyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOrCreateRef = async (input, collectionName) => {
    const q = query(collection(db, collectionName), where('name', '==', input));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].ref;
    const docRef = await addDoc(collection(db, collectionName), { name: input });
    return docRef;
  };

  const handleBlockChange = (blockId, content) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content } : b))
    );
  };

  const handleDeleteBlock = (blockId) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleAddBlock = (type) => {
    setBlocks([...blocks, { id: Date.now().toString(), type, content: '' }]);
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
    if (!title || !categoryInput) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      const categoryRef = await getOrCreateRef(categoryInput.trim(), 'categories');
      let difficultyRef = null;
      if (difficultyInput.trim()) {
        difficultyRef = await getOrCreateRef(difficultyInput.trim(), 'difficulties');
      }

      await updateDoc(doc(db, 'lessons', id), {
        title,
        categoryID: categoryRef.id,
        ...(difficultyRef && { difficultyID: difficultyRef.id }),
        visible,
        blocks,
      });

      alert('Lesson updated!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating lesson:', err);
      alert('Error updating lesson. Check the console for details.');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categoryInput.toLowerCase())
  );

  const filteredDifficulties = difficulties.filter((d) =>
    d.name.toLowerCase().includes(difficultyInput.toLowerCase())
  );

  return (
    <div className="create-lesson">
      <h2>Edit Lesson</h2>
      <form onSubmit={handleSubmit} className="lesson-form">
        <input
          type="text"
          placeholder="Lesson Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label>Category:</label>
        <div className="custom-dropdown" ref={categoryDropdownRef}>
          <input
            type="text"
            placeholder="Search or type category"
            value={categoryInput}
            onChange={(e) => {
              setCategoryInput(e.target.value);
              setCategoryDropdownOpen(true);
            }}
            onFocus={() => setCategoryDropdownOpen(true)}
            required
          />
          {categoryDropdownOpen && (
            <div className="dropdown-list">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="dropdown-item"
                    onClick={() => {
                      setCategoryInput(cat.name);
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    {cat.name}
                  </div>
                ))
              ) : (
                <div className="dropdown-item">No matches found</div>
              )}
            </div>
          )}
        </div>

        <label>Difficulty (optional):</label>
        <div className="custom-dropdown" ref={difficultyDropdownRef}>
          <input
            type="text"
            placeholder="Search or type difficulty"
            value={difficultyInput}
            onChange={(e) => {
              setDifficultyInput(e.target.value);
              setDifficultyDropdownOpen(true);
            }}
            onFocus={() => setDifficultyDropdownOpen(true)}
          />
          {difficultyDropdownOpen && (
            <div className="dropdown-list">
              {filteredDifficulties.length > 0 ? (
                filteredDifficulties.map((diff) => (
                  <div
                    key={diff.id}
                    className="dropdown-item"
                    onClick={() => {
                      setDifficultyInput(diff.name);
                      setDifficultyDropdownOpen(false);
                    }}
                  >
                    {diff.name}
                  </div>
                ))
              ) : (
                <div className="dropdown-item">No matches found</div>
              )}
            </div>
          )}
        </div>

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
              items={blocks.map((b) => b.id)}
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

        <button type="submit">Update Lesson</button>
      </form>
    </div>
  );
};

export default EditLesson;
