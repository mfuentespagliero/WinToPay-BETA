const tutorialSteps = [...document.querySelectorAll(".tutorial-step")];
const tutorialPractice = document.getElementById("tutorialPractice");
const tutorialBoard = document.getElementById("tutorialBoard");
const tutorialPracticeStatus = document.getElementById("tutorialPracticeStatus");
const tutorialReset = document.getElementById("tutorialReset");

const practiceSize = 5;
let completedSteps = 0;
let practiceCells = [];
let practiceFinished = false;

function completeTutorialStep(step) {
  if (step.classList.contains("completed")) return;

  step.classList.add("completed");
  step.classList.remove("active");
  completedSteps += 1;

  const nextStep = tutorialSteps[completedSteps];
  nextStep?.classList.add("active");

  if (completedSteps === tutorialSteps.length) {
    tutorialPractice.classList.add("enabled");
    resetPractice();
  }
}

document.querySelectorAll(".tutorial-choices, .tutorial-choice-grid").forEach((choices) => {
  choices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (!button) return;

    const step = choices.closest(".tutorial-step");
    const feedback = step.querySelector(".tutorial-feedback");
    if (!step.classList.contains("active")) return;

    if (button.dataset.choice === choices.dataset.answer) {
      button.classList.add("correct");
      if (button.dataset.choice === "flag") button.textContent = "⚑";
      if (button.dataset.choice === "safe") button.textContent = "✓";
      feedback.textContent = "¡Muy bien! Sigue al siguiente paso.";
      completeTutorialStep(step);
    } else {
      button.classList.add("wrong");
      feedback.textContent = "Casi. Mira las pistas e inténtalo otra vez.";
    }
  });
});

function createPracticeCells() {
  return Array.from({ length: practiceSize * practiceSize }, (_, index) => ({
    index,
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
    element: null,
  }));
}

function neighbors(index) {
  const row = Math.floor(index / practiceSize);
  const col = index % practiceSize;
  const result = [];

  for (let nextRow = row - 1; nextRow <= row + 1; nextRow += 1) {
    for (let nextCol = col - 1; nextCol <= col + 1; nextCol += 1) {
      if (
        nextRow >= 0 && nextRow < practiceSize &&
        nextCol >= 0 && nextCol < practiceSize &&
        (nextRow !== row || nextCol !== col)
      ) {
        result.push(nextRow * practiceSize + nextCol);
      }
    }
  }

  return result;
}

function placePracticeMines() {
  const mineIndexes = [2, 9, 15, 23];
  mineIndexes.forEach((index) => practiceCells[index].mine = true);
  practiceCells.forEach((cell) => {
    cell.adjacent = neighbors(cell.index).filter((index) => practiceCells[index].mine).length;
  });
}

function drawPracticeCell(cell) {
  cell.element.className = "tutorial-cell";
  cell.element.textContent = "";

  if (cell.flagged && !cell.revealed) {
    cell.element.classList.add("flagged");
    cell.element.textContent = "⚑";
  } else if (cell.revealed) {
    cell.element.classList.add("revealed");
    if (cell.mine) {
      cell.element.classList.add("mine");
      cell.element.textContent = "✹";
    } else if (cell.adjacent > 0) {
      cell.element.classList.add(`n${cell.adjacent}`);
      cell.element.textContent = cell.adjacent;
    }
  }
}

function revealPracticeArea(startIndex) {
  const pending = [startIndex];

  while (pending.length) {
    const index = pending.pop();
    const cell = practiceCells[index];
    if (cell.revealed || cell.flagged) continue;

    cell.revealed = true;
    drawPracticeCell(cell);

    if (cell.adjacent === 0) {
      neighbors(index).forEach((neighborIndex) => {
        const neighbor = practiceCells[neighborIndex];
        if (!neighbor.mine && !neighbor.revealed) pending.push(neighborIndex);
      });
    }
  }
}

function finishPractice(won) {
  practiceFinished = true;
  if (!won) {
    practiceCells.filter((cell) => cell.mine).forEach((cell) => {
      cell.revealed = true;
      drawPracticeCell(cell);
    });
  }

  tutorialPracticeStatus.textContent = won
    ? "¡Tutorial completado! Ya estás listo para jugar."
    : "Tocaste una mina. Reinicia y prueba otra vez.";
}

function checkPracticeWin() {
  const safeCells = practiceCells.filter((cell) => !cell.mine);
  if (safeCells.every((cell) => cell.revealed)) finishPractice(true);
}

function resetPractice() {
  if (completedSteps < tutorialSteps.length) return;

  practiceFinished = false;
  practiceCells = createPracticeCells();
  placePracticeMines();
  tutorialBoard.innerHTML = "";
  tutorialPracticeStatus.textContent = "Abre las casillas seguras y marca las minas.";

  practiceCells.forEach((cell) => {
    const button = document.createElement("button");
    let longPressTimer = null;
    let longPressed = false;
    button.type = "button";
    button.className = "tutorial-cell";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `Casilla ${cell.index + 1}`);

    button.addEventListener("click", () => {
      if (longPressed) {
        longPressed = false;
        return;
      }
      if (practiceFinished || cell.flagged) return;
      if (cell.mine) {
        cell.revealed = true;
        drawPracticeCell(cell);
        finishPractice(false);
        return;
      }

      revealPracticeArea(cell.index);
      checkPracticeWin();
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (practiceFinished || cell.revealed) return;
      cell.flagged = !cell.flagged;
      drawPracticeCell(cell);
    });

    button.addEventListener("touchstart", () => {
      longPressed = false;
      longPressTimer = window.setTimeout(() => {
        if (practiceFinished || cell.revealed) return;
        longPressed = true;
        cell.flagged = !cell.flagged;
        drawPracticeCell(cell);
      }, 500);
    }, { passive: true });

    button.addEventListener("touchend", () => {
      window.clearTimeout(longPressTimer);
    });

    button.addEventListener("touchcancel", () => {
      window.clearTimeout(longPressTimer);
    });

    cell.element = button;
    tutorialBoard.appendChild(button);
  });
}

tutorialReset?.addEventListener("click", resetPractice);
