import React, { useState } from 'react';
import './App.css';

// Color Palette (for reference in styles)
// Primary:   #2196F3 (blue)
// Secondary: #E3F2FD (light blue background)
// Accent:    #4CAF50 (green for highlights or winning info)

// -- Helper functions --

/**
 * Checks for a win in the provided squares.
 * @param {Array} squares - Array of length 9 ("X", "O" or null)
 * @returns {'X'|'O'|null} The winner symbol, or null
 */
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** This is a public function. */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function isDraw(squares) {
  /** This is a public function. */
  return squares.every((sq) => sq !== null) && !calculateWinner(squares);
}

// -- Core Components --

function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? ' winner' : ''}`}
      onClick={onClick}
      aria-label={value ? `Player ${value}` : 'Empty'}
      disabled={value !== null}
    >
      {value}
    </button>
  );
}

function Board({ squares, onPlay, winningLine, disabled }) {
  // Render 3x3 grid
  function renderSquare(i) {
    const highlight = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onPlay(i)}
        highlight={highlight}
      />
    );
  }
  return (
    <div className="ttt-board">
      {[0, 1, 2].map(row =>
        <div className="ttt-row" key={row}>
          {[0, 1, 2].map(col =>
            renderSquare(row * 3 + col)
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Top-level Tic Tac Toe Game Component
 */
function App() {
  // Simulated player assignment: local session is always 'X' starting.
  // In a real multiplayer app, this playerId and turn would sync with backend.
  // Here, state simulates two players in alternation.
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  const [gameId, setGameId] = useState(1); // Useful for restart
  // (For real-time: you would sync squares, isXNext, and gameActive via backend or WebSocket)
  // Placeholder: simulate sync - insert actual sync logic here.

  const winner = calculateWinner(squares);

  let status, winningLine;
  if (winner) {
    status = `Player ${winner} wins!`;
    // Find winning line for highlight
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] && squares[a] === squares[c]
      ) {
        winningLine = line;
        break;
      }
    }
  } else if (isDraw(squares)) {
    status = "It's a draw!";
  } else {
    status = `Player ${isXNext ? 'X' : 'O'}'s turn`;
  }

  // PUBLIC_INTERFACE
  function handleClick(i) {
    /** This is a public function. */
    if (!gameActive || squares[i] !== null) return;
    const nextSquares = squares.slice();
    nextSquares[i] = isXNext ? 'X' : 'O';
    setSquares(nextSquares);

    // Simulate real-time update: in real app, you would emit move to backend and listen for board updates.
    // --- Placeholder for backend real-time sync logic here ---

    if (calculateWinner(nextSquares) || isDraw(nextSquares)) {
      setGameActive(false);
    } else {
      setIsXNext(!isXNext);
    }
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    /** This is a public function. */
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setGameActive(true);
    setGameId(gameId + 1); // To reset board animations if needed
    // --- Placeholder: notify backend to restart game/global state if syncing ---
  }

  return (
    <div className="tic-tac-toe-app">
      <div className="ttt-root">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <Board
          key={gameId /* force remount for animation if needed */}
          squares={squares}
          winningLine={winningLine}
          onPlay={gameActive && !winner ? handleClick : () => {}}
          disabled={!gameActive}
        />
        <div className="ttt-status" style={{ color: winner ? '#4CAF50' : '#2196F3' }}>
          {status}
        </div>
        <button className="ttt-restart-btn" onClick={handleRestart}>
          Restart Game
        </button>
        <div className="ttt-note">
          {/* Placeholder for real-time: in a full stack app, backend sync code goes here */}
          <span className="ttt-placeholder">
            {/* Simulate multiplayer: share device. For true real-time play, connect to backend here! */}
            <strong>Real-time:</strong> Game state would sync via backend/WebSocket. (Stubbed for demo)
          </span>
        </div>
      </div>
      <footer className="ttt-footer">
        <a
          href="https://reactjs.org/"
          rel="noopener noreferrer"
          target="_blank"
          className="ttt-footer-link"
        >Powered by React</a>
      </footer>
    </div>
  );
}

export default App;
