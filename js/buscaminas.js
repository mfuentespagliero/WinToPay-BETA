
    const rows = 9;
    const cols = 9;
    const mineCount = 10;
    const digitClasses = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

    const boardElement = document.getElementById('board');
    const mineDisplay = document.getElementById('mineDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const resetButton = document.getElementById('resetButton');
    const statusText = document.getElementById('statusText');
    const face = document.getElementById('face');

    let board = [];
    let started = false;
    let finished = false;
    let revealedSafeCells = 0;
    let seconds = 0;
    let timerId = null;
    let mobileActionMenu = null;
    let selectedMobileCell = null;

    function isMobileGame() {
      return window.matchMedia('(max-width: 900px)').matches;
    }

    function closeMobileActionMenu() {
      mobileActionMenu?.remove();
      mobileActionMenu = null;
      selectedMobileCell?.element?.classList.remove('action-selected');
      selectedMobileCell = null;
    }

    function openMobileActionMenu(cell) {
      closeMobileActionMenu();
      if (cell.revealed || finished) return;

      selectedMobileCell = cell;
      cell.element.classList.add('action-selected');

      const menu = document.createElement('div');
      menu.className = 'mine-action-menu';
      menu.setAttribute('role', 'menu');
      menu.innerHTML = `
        <button type="button" class="mine-action-flag" role="menuitem" aria-label="${cell.flagged ? 'Quitar bandera' : 'Poner bandera'}" title="${cell.flagged ? 'Quitar bandera' : 'Poner bandera'}">
          <span aria-hidden="true">${cell.flagged ? '×' : '⚑'}</span>
        </button>
        <button type="button" class="mine-action-reveal" role="menuitem" aria-label="Cavar o abrir casilla" title="Cavar / Abrir">
          <span aria-hidden="true">⛏</span>
        </button>
      `;

      menu.querySelector('.mine-action-flag').addEventListener('click', (event) => {
        event.stopPropagation();
        handleFlag(cell.row, cell.col, true);
        closeMobileActionMenu();
      });

      menu.querySelector('.mine-action-reveal').addEventListener('click', (event) => {
        event.stopPropagation();
        handleReveal(cell.row, cell.col);
        closeMobileActionMenu();
      });

      document.body.appendChild(menu);
      mobileActionMenu = menu;

      const cellRect = cell.element.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewportPadding = 8;
      let left = cellRect.left + cellRect.width / 2 - menuRect.width / 2;
      let top = cellRect.bottom + 8;

      left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuRect.width - viewportPadding));
      if (top + menuRect.height > window.innerHeight - viewportPadding) {
        top = cellRect.top - menuRect.height - 8;
      }

      menu.style.left = `${left}px`;
      menu.style.top = `${Math.max(viewportPadding, top)}px`;
    }

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
      closeMobileActionMenu();
      stopTimer();
      board = createEmptyBoard();
      started = false;
      finished = false;
      revealedSafeCells = 0;
      seconds = 0;
      statusText.textContent = '';
      face.className = 'smiley';
      renderDisplays();
      renderBoard();
    }

    function renderDisplays() {
      updateMineDisplay();
      setDisplay(timerDisplay, seconds);
    }

    function updateMineDisplay() {
      const flaggedCells = board.flat().filter((cell) => cell.flagged).length;
      setDisplay(mineDisplay, Math.max(0, mineCount - flaggedCells));
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

          cellElement.addEventListener('click', (event) => {
            if (isMobileGame()) {
              event.stopPropagation();
              openMobileActionMenu(cell);
              return;
            }
            handleReveal(row, col);
          });
          cellElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            if (!isMobileGame()) handleFlag(row, col);
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

    }

    function handleFlag(row, col, allowBeforeStart = false) {
      if (finished || (!started && !allowBeforeStart)) {
        return;
      }

      const cell = board[row][col];

      if (cell.revealed) {
        return;
      }

      cell.flagged = !cell.flagged;
      drawCell(cell);
      updateMineDisplay();
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
        endGame(true);
      }
    }

function endGame(isWin) {
  closeMobileActionMenu();
  finished = true;
  stopTimer();

  if (isWin) {
    const previousBest = Number(localStorage.getItem('wintopayFinalTime'));
    const bestTime = previousBest > 0 ? Math.min(previousBest, seconds) : seconds;
    localStorage.setItem('wintopayFinalTime', bestTime);
    face.className = 'smiley cool';
    statusText.textContent = `¡Reto completado en ${seconds}s! Mejor tiempo: ${bestTime}s.`;
    updateCatalogLocks(bestTime);
  } else {
    revealAllMines();
    face.className = 'smiley dead';
    statusText.textContent = 'Juego terminado.';
  }
}

resetButton.addEventListener('click', resetGame);
document.addEventListener('click', (event) => {
  if (mobileActionMenu && !event.target.closest('.mine-action-menu')) {
    closeMobileActionMenu();
  }
});
window.addEventListener('resize', () => {
  if (!isMobileGame()) closeMobileActionMenu();
});
resetGame();
