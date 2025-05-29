import React, { useState, useEffect, useRef } from 'react';
import './ToDoApp.css';

const PRIORITY_COLORS = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const IconEdit = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const IconDelete = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    stroke="white"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function ToDoApp() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [filterPriority, setFilterPriority] = useState('all');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('medium');

  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
    setNewTaskPriority('medium');
    inputRef.current?.focus();
  };

  const deleteTask = id => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  const toggleCompleted = id => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const startEditing = task => {
    setEditTaskId(task.id);
    setEditTaskText(task.text);
    setEditTaskPriority(task.priority);
  };

  const saveEditing = id => {
    if (!editTaskText.trim()) return;
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, text: editTaskText.trim(), priority: editTaskPriority }
          : task
      )
    );
    setEditTaskId(null);
    setEditTaskText('');
  };

  const cancelEditing = () => {
    setEditTaskId(null);
    setEditTaskText('');
  };

  const clearCompleted = () => {
    if (window.confirm('Удалить все выполненные задачи?')) {
      setTasks(prev => prev.filter(task => !task.completed));
    }
  };

  const filteredTasks = tasks.filter(
    task => filterPriority === 'all' || task.priority === filterPriority
  );

  const remainingCount = tasks.filter(task => !task.completed).length;

  const handleKeyDownNewTask = e => {
    if (e.key === 'Enter') addTask();
  };

  const handleKeyDownEditTask = e => {
    if (e.key === 'Enter') saveEditing(editTaskId);
    else if (e.key === 'Escape') cancelEditing();
  };

  return (
    <div className="todo-container" role="main">
      <h2>ToDo List с приоритетами и редактированием</h2>

      <div className="form-add">
        <input
          ref={inputRef}
          type="text"
          placeholder="Новая задача"
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          onKeyDown={handleKeyDownNewTask}
          aria-label="Поле ввода новой задачи"
          autoComplete="off"
        />
        <select
          value={newTaskPriority}
          onChange={e => setNewTaskPriority(e.target.value)}
          aria-label="Выбор приоритета новой задачи"
          title="Приоритет задачи"
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
        <button
          onClick={addTask}
          disabled={!newTaskText.trim()}
          aria-label="Добавить задачу"
          title="Добавить задачу"
        >
          Добавить
        </button>
      </div>

      <div className="controls">
        <div>
          <label htmlFor="filterPriority">Фильтр по приоритету:</label>
          <select
            id="filterPriority"
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            aria-label="Фильтр задач по приоритету"
            title="Фильтр задач по приоритету"
          >
            <option value="all">Все</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>

        <div className="stats" aria-live="polite">
          Всего задач: <b>{tasks.length}</b>, осталось: <b>{remainingCount}</b>
        </div>

        <button
          onClick={clearCompleted}
          disabled={tasks.every(t => !t.completed)}
          className="clear-completed"
          aria-label="Удалить все выполненные задачи"
          title="Удалить все выполненные задачи"
        >
          Очистить выполненные
        </button>
      </div>

      <ul className="task-list" aria-label="Список задач">
        {filteredTasks.length === 0 && (
          <li className="no-tasks">Задачи не найдены</li>
        )}

        {filteredTasks.map(task => (
          <li
            key={task.id}
            className={task.completed ? 'completed' : ''}
            tabIndex={-1}
          >
            <button
              onClick={() => toggleCompleted(task.id)}
              aria-label={
                task.completed
                  ? 'Отметить задачу как невыполненную'
                  : 'Отметить задачу как выполненную'
              }
              title={
                task.completed
                  ? 'Задача выполнена'
                  : 'Отметить как выполненную'
              }
              className={`btn-circle ${task.completed ? 'completed' : ''}`}
              type="button"
            >
              {task.completed && <IconCheck />}
            </button>

            {editTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editTaskText}
                  onChange={e => setEditTaskText(e.target.value)}
                  onKeyDown={handleKeyDownEditTask}
                  autoFocus
                  aria-label="Редактировать текст задачи"
                  className="edit-input"
                />
                <select
                  value={editTaskPriority}
                  onChange={e => setEditTaskPriority(e.target.value)}
                  aria-label="Редактировать приоритет задачи"
                  className="edit-select"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
                <button
                  onClick={() => saveEditing(task.id)}
                  className="btn-edit-save"
                  title="Сохранить изменения"
                  type="button"
                >
                  Сохранить
                </button>
                <button
                  onClick={cancelEditing}
                  className="btn-edit-cancel"
                  title="Отменить редактирование"
                  type="button"
                >
                  Отмена
                </button>
              </>
            ) : (
              <>
                <span
                  className={`task-text ${task.completed ? 'completed' : ''}`}
                  title="Текст задачи"
                >
                  {task.text}
                </span>
                <span
                  className={`priority-dot ${PRIORITY_COLORS[task.priority]}`}
                  title={`Приоритет: ${task.priority}`}
                  aria-label={`Приоритет задачи: ${task.priority}`}
                />
                <button
                  onClick={() => startEditing(task)}
                  aria-label="Редактировать задачу"
                  title="Редактировать задачу"
                  className="btn-small edit"
                  type="button"
                >
                  <IconEdit />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="Удалить задачу"
                  title="Удалить задачу"
                  className="btn-small delete"
                  type="button"
                >
                  <IconDelete />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDoApp;

