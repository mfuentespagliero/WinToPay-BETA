
    const rows = 9;
    const cols = 9;
    const mineCount = 10;
    const scorePerReveal = 10;
    const winBonus = 100;
    const digitClasses = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

    const boardElement = document.getElementById('board');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const resetButton = document.getElementById('resetButton');
    const statusText = document.getElementById('statusText');
    const face = document.getElementById('face');

    let board = [];
    let started = false;
    let finished = false;
    let revealedSafeCells = 0;
    let score = 0;
    let seconds = 0;
    let timerId = null;

    function createEmptyBoard() {
      return Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          row,
          col,
          mine: false,
          revealed: false,
          flagged: false,
          adjacent: 0,
          element: null,
        }))
      );
    }

    function resetGame() {
      stopTimer();
      board = createEmptyBoard();
      started = false;
      finished = false;
      revealedSafeCells = 0;
      score = 0;
      seconds = 0;
      statusText.textContent = '';
      face.className = 'smiley';
      renderDisplays();
      renderBoard();
    }

    function renderDisplays() {
      setDisplay(scoreDisplay, score);
      setDisplay(timerDisplay, seconds);
    }

    function setDisplay(container, value) {
      const clamped = Math.max(0, Math.min(999, value));
      const digits = String(clamped).padStart(3, '0').split('');
      const nodes = container.querySelectorAll('.digit');

      digits.forEach((digit, index) => {
        nodes[index].className = `digit ${digitClasses[Number(digit)]}`;
      });
    }

    function renderBoard() {
      boardElement.innerHTML = '';

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cell = board[row][col];
          const cellElement = document.createElement('button');
          cellElement.type = 'button';
          cellElement.className = 'cell hidden';
          cellElement.setAttribute('role', 'gridcell');
          cellElement.setAttribute('aria-label', `Fila ${row + 1}, columna ${col + 1}`);

          cellElement.addEventListener('click', () => handleReveal(row, col));
          cellElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            handleFlag(row, col);
          });

          cell.element = cellElement;
          boardElement.appendChild(cellElement);
        }
      }
    }

    function placeMines(firstRow, firstCol) {
      const protectedIndexes = new Set();

      for (let row = firstRow - 1; row <= firstRow + 1; row += 1) {
        for (let col = firstCol - 1; col <= firstCol + 1; col += 1) {
          if (isInside(row, col)) {
            protectedIndexes.add(`${row}-${col}`);
          }
        }
      }

      let placed = 0;

      while (placed < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const key = `${row}-${col}`;

        if (protectedIndexes.has(key) || board[row][col].mine) {
          continue;
        }

        board[row][col].mine = true;
        placed += 1;
      }

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cell = board[row][col];
          cell.adjacent = countAdjacentMines(row, col);
        }
      }
    }

    function countAdjacentMines(row, col) {
      if (board[row][col].mine) {
        return 0;
      }

      let total = 0;

      for (let nextRow = row - 1; nextRow <= row + 1; nextRow += 1) {
        for (let nextCol = col - 1; nextCol <= col + 1; nextCol += 1) {
          if ((nextRow !== row || nextCol !== col) && isInside(nextRow, nextCol) && board[nextRow][nextCol].mine) {
            total += 1;
          }
        }
      }

      return total;
    }

    function isInside(row, col) {
      return row >= 0 && row < rows && col >= 0 && col < cols;
    }

    function startGame(firstRow, firstCol) {
      placeMines(firstRow, firstCol);
      started = true;
      timerId = window.setInterval(() => {
        seconds += 1;
        setDisplay(timerDisplay, seconds);
      }, 1000);
    }

    function stopTimer() {
      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    function handleReveal(row, col) {
      if (finished) {
        return;
      }

      const cell = board[row][col];

      if (!started) {
        startGame(row, col);
      }

      if (cell.flagged || cell.revealed) {
        return;
      }

      if (cell.mine) {
        revealMine(cell);
        endGame(false);
        return;
      }

      revealSafeArea(row, col);
      checkWin();
    }

    function revealSafeArea(startRow, startCol) {
      const stack = [[startRow, startCol]];

      while (stack.length > 0) {
        const [row, col] = stack.pop();
        const cell = board[row][col];

        if (cell.revealed || cell.flagged) {
          continue;
        }

        cell.revealed = true;
        revealedSafeCells += 1;
        score += scorePerReveal;
        drawCell(cell);

        if (cell.adjacent === 0) {
          for (let nextRow = row - 1; nextRow <= row + 1; nextRow += 1) {
            for (let nextCol = col - 1; nextCol <= col + 1; nextCol += 1) {
              if ((nextRow !== row || nextCol !== col) && isInside(nextRow, nextCol)) {
                const neighbor = board[nextRow][nextCol];
                if (!neighbor.revealed && !neighbor.mine && !neighbor.flagged) {
                  stack.push([nextRow, nextCol]);
                }
              }
            }
          }
        }
      }

      setDisplay(scoreDisplay, score);
    }

    function handleFlag(row, col) {
      if (finished || !started) {
        return;
      }

      const cell = board[row][col];

      if (cell.revealed) {
        return;
      }

      cell.flagged = !cell.flagged;
      drawCell(cell);
    }

    function drawCell(cell) {
      const element = cell.element;
      element.innerHTML = '';
      element.className = 'cell';

      if (cell.revealed) {
        element.classList.add('revealed');

        if (cell.mine) {
          element.classList.add('mine');
          const mineShape = document.createElement('span');
          mineShape.className = 'mine-shape';
          const mineCross = document.createElement('span');
          mineCross.className = 'mine-cross';
          element.appendChild(mineShape);
          element.appendChild(mineCross);
          return;
        }

        if (cell.adjacent > 0) {
          element.textContent = cell.adjacent;
          element.classList.add(`n${cell.adjacent}`);
        }
      } else {
        element.classList.add('hidden');
        if (cell.flagged) {
          element.classList.add('flagged');
        }
      }
    }

    function revealMine(cell) {
      cell.revealed = true;
      drawCell(cell);
    }

    function revealAllMines() {
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cell = board[row][col];
          if (cell.mine && !cell.revealed) {
            cell.revealed = true;
            drawCell(cell);
          }
        }
      }
    }

    function checkWin() {
      const totalSafeCells = rows * cols - mineCount;
      if (revealedSafeCells === totalSafeCells) {
        score += winBonus;
        setDisplay(scoreDisplay, score);
        endGame(true);
      }
    }

function endGame(isWin) {
  finished = true;
  stopTimer();

  if (isWin) {
    // Solo desbloquear si ganó en 20 segundos o menos
    localStorage.setItem('wintopayFinalTime', seconds);
    face.className = 'smiley cool';
    statusText.textContent = seconds <= 20
      ? '¡Reto completado! Productos desbloqueados.'
      : 'Terminaste en ' + seconds + 's. Necesitas ≤20s para desbloquear.';
    updateCatalogLocks(seconds);
  } else {
    revealAllMines();
    face.className = 'smiley dead';
    statusText.textContent = 'Juego terminado.';
  }
}

function updateCatalogLocks(finalTime) {
  document.querySelectorAll(".product-card[data-threshold]").forEach((card) => {
    const threshold = Number(card.dataset.threshold);
    const unlocked  = finalTime <= 20 && finalTime < threshold;
    card.classList.toggle("unlocked",  unlocked);
    card.classList.toggle("locked",   !unlocked);
  });
}

resetButton.addEventListener('click', resetGame);
resetGame();

// Leer tiempo guardado al cargar la página
const storedTime = Number(localStorage.getItem("wintopayFinalTime"));
if (storedTime > 0) updateCatalogLocks(storedTime);