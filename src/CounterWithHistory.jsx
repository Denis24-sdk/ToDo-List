import React, { useState } from 'react';

function CounterWithHistory() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);

  const increment = () => {
    setHistory(prev => [...prev, count]);
    setCount(count + 1);
  };

  const decrement = () => {
    setHistory(prev => [...prev, count]);
    setCount(count - 1);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(history.slice(0, history.length - 1));
    setCount(previous);
  };

  return (
    <div>
      <h1>Счётчик: {count}</h1>
      <button onClick={increment}>Увеличить</button>
      <button onClick={decrement}>Уменьшить</button>
      <button onClick={undo} disabled={history.length === 0}>
        Отменить
      </button>
      <p>История: {history.join(', ')}</p>
    </div>
  );
}

export default CounterWithHistory;

