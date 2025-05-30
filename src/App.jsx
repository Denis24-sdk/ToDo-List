import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const PRIORITIES = [
  { key: "low", label: "Низкий", color: "#6c757d" },
  { key: "medium", label: "Средний", color: "#0d6efd" },
  { key: "high", label: "Высокий", color: "#dc3545" },
];

function TodoItem({
  todo,
  toggleComplete,
  deleteTodo,
  editTodo,
  dragHandlers,
  isDragging,
  dragOver,
  setDragOver,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const [priority, setPriority] = useState(todo.priority);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const saveEdit = () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setText(todo.text);
      setIsEditing(false);
      return;
    }
    editTodo(todo.id, trimmed, priority);
    setIsEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") {
      setText(todo.text);
      setPriority(todo.priority);
      setIsEditing(false);
    }
  };

  const priorityColor = PRIORITIES.find((p) => p.key === todo.priority)?.color;

  return (
    <li
      className={`task-item${todo.completed ? " completed" : ""}${
        isDragging ? " dragging" : ""
      }${dragOver === todo.id ? " drag-over" : ""}`}
      draggable={!isEditing}
      {...dragHandlers}
      onDragEnter={() => setDragOver(todo.id)}
      onDragLeave={() => setDragOver(null)}
      aria-label={`Задача: ${todo.text}, приоритет: ${
        PRIORITIES.find((p) => p.key === todo.priority)?.label || todo.priority
      }`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleComplete(todo.id)}
        disabled={isEditing}
        aria-label={`Отметить задачу "${todo.text}" как выполненную`}
      />
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            className="edit-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Редактировать текст задачи"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Выбрать приоритет задачи"
          >
            {PRIORITIES.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={saveEdit}
            aria-label="Сохранить изменения задачи"
            className="icon-button"
            title="Сохранить"
          >
            💾
          </button>
          <button
            onClick={() => {
              setText(todo.text);
              setPriority(todo.priority);
              setIsEditing(false);
            }}
            aria-label="Отменить редактирование задачи"
            className="icon-button"
            title="Отменить"
          >
            ✖️
          </button>
        </>
      ) : (
        <>
          <span
            className="task-text"
            onClick={() => setIsEditing(true)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditing(true);
            }}
            role="button"
            style={{ borderLeft: `4px solid ${priorityColor}` }}
            aria-label="Редактировать задачу"
          >
            {todo.text}
          </span>
          <button
            className="icon-button delete-btn"
            onClick={() => deleteTodo(todo.id)}
            aria-label={`Удалить задачу "${todo.text}"`}
            title="Удалить"
          >
            🗑️
          </button>
        </>
      )}
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [sortBy, setSortBy] = useState("priority"); // priority, date
  const [sortAsc, setSortAsc] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputPriority, setInputPriority] = useState("medium");
  const [lastDeleted, setLastDeleted] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const addTask = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newTask = {
      id: Date.now(),
      text: trimmed,
      completed: false,
      priority: inputPriority,
    };
    setTasks((prev) => [newTask, ...prev]);
    setInputText("");
    setInputPriority("medium");
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id) => {
    setTasks((prev) => {
      const deleted = prev.find((t) => t.id === id);
      setLastDeleted(deleted);
      return prev.filter((t) => t.id !== id);
    });
  };

  const undoDelete = () => {
    if (lastDeleted) {
      setTasks((prev) => [lastDeleted, ...prev]);
      setLastDeleted(null);
    }
  };

  const editTodo = (id, newText, newPriority) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, text: newText, priority: newPriority } : t
      )
    );
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const order = (p) => PRIORITIES.findIndex((x) => x.key === p);
      return sortAsc
        ? order(a.priority) - order(b.priority)
        : order(b.priority) - order(a.priority);
    }
    if (sortBy === "date") {
      return sortAsc ? a.id - b.id : b.id - a.id;
    }
    return 0;
  });

  // Drag and drop handlers
  const onDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {}
  };
  const onDragOver = (e, id) => {
    e.preventDefault();
    if (id !== dragOverId) setDragOverId(id);
  };
  const onDrop = (e, id) => {
    e.preventDefault();
    if (draggedId === null) return;
    if (draggedId === id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = sortedTasks.findIndex((t) => t.id === draggedId);
    const dropIndex = sortedTasks.findIndex((t) => t.id === id);
    if (draggedIndex === -1 || dropIndex === -1) return;

    const newTasksOrder = [...sortedTasks];
    const [moved] = newTasksOrder.splice(draggedIndex, 1);
    newTasksOrder.splice(dropIndex, 0, moved);

    // Обновляем порядок в исходном массиве tasks
    const filteredIds = sortedTasks.map((t) => t.id);
    const restTasks = tasks.filter((t) => !filteredIds.includes(t.id));
    const reorderedTasks = [];

    for (let tid of newTasksOrder.map((t) => t.id)) {
      const task = tasks.find((t) => t.id === tid);
      if (task) reorderedTasks.push(task);
    }
    reorderedTasks.push(...restTasks);
    setTasks(reorderedTasks);

    setDraggedId(null);
    setDragOverId(null);
  };
  const onDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const countActive = tasks.filter((t) => !t.completed).length;
  const countCompleted = tasks.filter((t) => t.completed).length;

  return (
    <div className="app-container" role="main">
      <header className="header">
        <h1 tabIndex={-1}>ToDo List</h1>
        <button
          className="theme-toggle"
          aria-label="Переключить тему"
          onClick={() => setDarkMode(!darkMode)}
          title="Переключить тему"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      <section className="add-task" aria-label="Добавить задачу">
        <input
          type="text"
          placeholder="Новая задача"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
          aria-label="Введите текст новой задачи"
          autoComplete="off"
        />
        <select
          value={inputPriority}
          onChange={(e) => setInputPriority(e.target.value)}
          aria-label="Выберите приоритет задачи"
        >
          {PRIORITIES.map(({ key, label, color }) => (
            <option key={key} value={key} style={{ color }}>
              {label}
            </option>
          ))}
        </select>
        <button onClick={addTask} aria-label="Добавить задачу" disabled={!inputText.trim()}>
          Добавить
        </button>
      </section>

      <section className="controls" aria-label="Управление списком задач">
        <div className="filter-sort">
          <div className="filter">
            <label htmlFor="filter-select">Фильтр:</label>
            <select
              id="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="completed">Выполненные</option>
            </select>
            {filter !== "all" && (
              <button
                className="reset-filter"
                onClick={() => setFilter("all")}
                aria-label="Сбросить фильтр"
                title="Сбросить фильтр"
              >
                ✖
              </button>
            )}
          </div>

          <div className="sort">
            <label htmlFor="sort-select">Сортировать по:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="priority">Приоритету</option>
              <option value="date">Дате создания</option>
            </select>
            <button
              className="sort-direction"
              onClick={() => setSortAsc((asc) => !asc)}
              aria-label={`Сменить порядок сортировки на ${sortAsc ? "убывающий" : "возрастающий"}`}
              title="Сменить порядок сортировки"
            >
              {sortAsc ? "⬆️" : "⬇️"}
            </button>
          </div>
        </div>

        <button
          onClick={clearCompleted}
          disabled={countCompleted === 0}
          aria-label="Очистить выполненные задачи"
          className="clear-btn"
          title="Очистить выполненные задачи"
        >
          Очистить выполненные ({countCompleted})
        </button>
      </section>

      <section className="counts" aria-live="polite" aria-atomic="true">
        Всего: {tasks.length}, Активных: {countActive}, Выполненных: {countCompleted}
      </section>

      {lastDeleted && (
        <section className="undo" aria-live="assertive">
          Задача удалена.{" "}
          <button onClick={undoDelete} aria-label="Отменить удаление задачи">
            ↩️ Отменить
          </button>
        </section>
      )}

      <ul className="task-list" aria-label="Список задач">
        {sortedTasks.map((task) => (
          <TodoItem
            key={task.id}
            todo={task}
            toggleComplete={toggleComplete}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
            dragHandlers={{
              onDragStart: (e) => onDragStart(e, task.id),
              onDragOver: (e) => onDragOver(e, task.id),
              onDrop: (e) => onDrop(e, task.id),
              onDragEnd,
            }}
            isDragging={draggedId === task.id}
            dragOver={dragOverId}
            setDragOver={setDragOverId}
          />
        ))}
      </ul>
    </div>
  );
}

