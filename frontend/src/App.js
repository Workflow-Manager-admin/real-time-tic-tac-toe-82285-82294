import React, { useState, useEffect } from 'react';
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

/**
 * Gets the computer's move.
 * Basic AI: Choose the first available cell, or block/win if possible.
 * @param {Array} squares - current board
 * @param {'X'|'O'} aiSymbol - 'X' or 'O'
 * @returns {number|null} index for AI move, or null if not available
 */
// PUBLIC_INTERFACE
export function getBestAIMove(squares, aiSymbol) {
  /** This is a public function. */
  // Try to win, then block, otherwise pick first empty
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const opponent = aiSymbol === 'X' ? 'O' : 'X';
  // 1. Win if possible
  for (const [a, b, c] of lines) {
    let values = [squares[a], squares[b], squares[c]];
    let aiCount = values.filter((v) => v === aiSymbol).length;
    let emptyIdx = [a, b, c].find((idx) => squares[idx] === null);
    if (aiCount === 2 && emptyIdx !== undefined && values.filter((v) => v === null).length === 1) {
      return emptyIdx;
    }
  }
  // 2. Block opponent
  for (const [a, b, c] of lines) {
    let values = [squares[a], squares[b], squares[c]];
    let opCount = values.filter((v) => v === opponent).length;
    let emptyIdx = [a, b, c].find((idx) => squares[idx] === null);
    if (opCount === 2 && emptyIdx !== undefined && values.filter((v) => v === null).length === 1) {
      return emptyIdx;
    }
  }
  // 3. Pick center if possible
  if (squares[4] === null) return 4;
  // 4. Pick a corner
  const corners = [0, 2, 6, 8];
  for (let idx of corners) {
    if (squares[idx] === null) return idx;
  }
  // 5. Pick any open spot
  for (let i = 0; i < squares.length; ++i) {
    if (squares[i] === null) return i;
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
  // Game mode: 'human' (2 players) or 'computer'
  const [mode, setMode] = useState('human');
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // 'X' always starts
  const [gameActive, setGameActive] = useState(true);
  const [gameId, setGameId] = useState(1); // For restart
  const [aiThinking, setAiThinking] = useState(false);

  // For "vs computer" X = human, O = AI
  const isVsComputer = mode === 'computer';
  const aiSymbol = isVsComputer ? 'O' : null;
  const humanSymbol = 'X';

  // Determine winner and winning line
  const winner = calculateWinner(squares);
  let status, winningLine;
  if (winner) {
    status = `${winner === aiSymbol && isVsComputer ? 'Computer' : 'Player ' + winner} wins!`;
    // Find line for highlighting
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
  } else if (isVsComputer) {
    status = isXNext ? "Your turn" : "Computer's turn";
  } else {
    status = `Player ${isXNext ? 'X' : 'O'}'s turn`;
  }

  // --- AI Effect: If it's the computer's turn, make a move ---
  useEffect(() => {
    if (
      isVsComputer &&
      !winner &&
      !isDraw(squares) &&
      !isXNext && // Computer is always 'O'
      gameActive
    ) {
      setAiThinking(true);
      const t = setTimeout(() => {
        // Let AI play
        const aiMove = getBestAIMove(squares, aiSymbol);
        if (aiMove !== null) {
          handleClick(aiMove, true);
        }
        setAiThinking(false);
      }, 500); // Delay for user experience
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [squares, isXNext, gameActive, mode]);

  // PUBLIC_INTERFACE
  function handleClick(i, isAIMove = false) {
    /** This is a public function. */
    if (!gameActive || squares[i] !== null) return;
    if (isVsComputer && !isAIMove && !isXNext) return; // Block human when it's AI turn

    const nextSquares = squares.slice();
    nextSquares[i] = isXNext ? 'X' : 'O';
    setSquares(nextSquares);

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
    setGameId(gameId + 1);
    setAiThinking(false);
    // --- Placeholder: backend/game state reset if syncing ---
  }

  // Handle mode switching
  function handleModeChange(newMode) {
    if (mode !== newMode) {
      setMode(newMode);
      setSquares(Array(9).fill(null));
      setIsXNext(true); // X always starts, so human goes first
      setGameActive(true);
      setGameId(gameId + 1);
      setAiThinking(false);
    }
  }

  // Optionally block clicks during AI "thinking"
  const boardDisabled = !gameActive || (isVsComputer && !isXNext);

  // Mode UI: selector
  function ModeSelector() {
    return (
      <div style={{
        marginBottom: "22px", display: "flex", justifyContent: "center",
        gap: "16px"
      }}>
        <button
          onClick={() => handleModeChange('human')}
          className="ttt-restart-btn"
          style={{
            background: mode === 'human' ? 'linear-gradient(90deg, #4CAF50, #2626e3 90%)' : undefined,
            color: mode === 'human' ? '#fff43a' : undefined,
            boxShadow: mode === 'human' ? "0 0 16px #4CAF50aa" : undefined
          }}
          disabled={mode === 'human'}
        >2 Players</button>
        <button
          onClick={() => handleModeChange('computer')}
          className="ttt-restart-btn"
          style={{
            background: mode === 'computer' ? 'linear-gradient(90deg, #f72585, #2626e3 90%)' : undefined,
            color: mode === 'computer' ? '#fff43a' : undefined,
            boxShadow: mode === 'computer' ? "0 0 16px #f72585bb" : undefined
          }}
          disabled={mode === 'computer'}
        >Vs Computer</button>
      </div>
    );
  }

  return (
    <div className="tic-tac-toe-app">
      <div className="ttt-root">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <ModeSelector />
        <Board
          key={gameId}
          squares={squares}
          winningLine={winningLine}
          onPlay={boardDisabled ? () => {} : handleClick}
          disabled={boardDisabled}
        />
        <div className="ttt-status" style={{ color: winner ? '#4CAF50' : (isVsComputer && !isXNext ? '#f72585' : '#2196F3') }}>
          {status}
          {aiThinking && isVsComputer && !winner && !isDraw(squares) && (
            <span style={{ marginLeft: "9px", fontWeight: "bold", color: "#00fff7", fontSize: "1em" }}>
              (Thinking…)
            </span>
          )}
        </div>
        <button className="ttt-restart-btn" onClick={handleRestart}>
          Restart Game
        </button>
        <div className="ttt-note">
          {isVsComputer ? (
            <span className="ttt-placeholder">
              You (<strong>X</strong>) vs Computer (<strong>O</strong>). Try to win!
            </span>
          ) : (
            <span className="ttt-placeholder">
              <strong>Real-time:</strong> Game state would sync via backend/WebSocket. (Stubbed for demo)
            </span>
          )}
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
