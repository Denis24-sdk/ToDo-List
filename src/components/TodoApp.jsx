import React, { useState, useEffect, useCallback } from 'react';
import TodoItem from './TodoItem';

const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const FILTER_NAMES = {
  [FILTERS.ALL]: 'Все',
  [FILTERS.ACTIVE]: 'Активные',
  [FILTERS.COMPLETED]: 'Выполненные',
};

function TodoApp() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState(FILTERS.ALL);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newTodo = {
      id: Date.now(),
      text: trimmed,
      completed: false,
    };
    setTodos(todos => [...todos, newTodo]);
    setInput('');
  }, [input]);

  const toggleComplete = useCallback((id) => {
    setTodos(todos => todos.map(todo => 
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    ));
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(todos => todos.filter(todo => todo.id !== id));
  }, []);

  const editTodo = useCallback((id, newText) => {
    setTodos(todos => todos.map(todo =>
      todo.id === id ? {...todo, text: newText} : todo
    ));
  }, []);

  const clearCompleted = () => {
    setTodos(todos => todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === FILTERS.ACTIVE) return !todo.completed;
    if (filter === FILTERS.COMPLETED) return todo.completed;
    return true;
  });

  const activeCount = todos.reduce((count, todo) => count + (todo.completed ? 0 : 1), 0);

  return (
    <div className="todo-app">
      <h2>ToDo-лист</h2>
      <div className="input-row">
        <input 
          type="text" 
          value={input} 
          placeholder="Введите задачу" 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
          className="todo-input"
        />
        <button onClick={addTodo} className="add-btn" aria-label="Добавить задачу">Добавить</button>
      </div>

      {todos.length > 0 && (
        <>
          <ul className="todo-list">
            {filteredTodos.length === 0 && <li className="empty-msg">Нет задач</li>}
            {filteredTodos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                toggleComplete={toggleComplete} 
                deleteTodo={deleteTodo} 
                editTodo={editTodo}
              />
            ))}
          </ul>

          <div className="footer">
            <span>{activeCount} {activeCount === 1 ? 'задача' : 'задач'} осталось</span>

            <div className="filters">
              {Object.values(FILTERS).map(key => (
                <button 
                  key={key} 
                  onClick={() => setFilter(key)} 
                  className={filter === key ? 'active' : ''}
                  aria-pressed={filter === key}
                >
                  {FILTER_NAMES[key]}
                </button>
              ))}
            </div>

            <button 
              onClick={clearCompleted} 
              disabled={todos.every(todo => !todo.completed)}
              className="clear-btn"
            >
              Очистить выполненные
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TodoApp;

