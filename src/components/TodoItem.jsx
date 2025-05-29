import React, { useState, useEffect, useRef, memo } from 'react';

const TodoItem = memo(function TodoItem({ todo, toggleComplete, deleteTodo, editTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditText(e.target.value);
  };

  const handleBlur = () => {
    finishEditing();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const finishEditing = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      editTodo(todo.id, trimmed);
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Удалить задачу?')) {
      deleteTodo(todo.id);
    }
  };

  return (
    <li className="todo-item">
      <label className="checkbox-label">
        <input 
          type="checkbox" 
          checked={todo.completed} 
          onChange={() => toggleComplete(todo.id)} 
        />
        <span className="checkmark" />
      </label>

      {isEditing ? (
        <input 
          ref={inputRef}
          className="edit-input"
          value={editText}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <span 
          className={`todo-text ${todo.completed ? 'completed' : ''}`}
          onDoubleClick={handleDoubleClick}
          title="Двойной клик для редактирования"
        >
          {todo.text}
        </span>
      )}

      <button className="delete-btn" onClick={handleDelete} title="Удалить задачу">
        &times;
      </button>
    </li>
  );
});

export default TodoItem;

