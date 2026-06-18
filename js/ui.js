const body = document.body;

const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuOverlay = document.querySelector(".menu-overlay");

const cartToggle = document.querySelector(".cart-toggle");
const cartClose = document.querySelector(".cart-close");
const cartOverlay = document.querySelector(".cart-overlay");
const tutorialToggle = document.getElementById("tutorialToggle");
const tutorialClose = document.getElementById("tutorialClose");
const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialPanel = document.getElementById("tutorialPanel");

function closeTutorial() {
  body.classList.remove("tutorial-open");
  tutorialToggle?.setAttribute("aria-expanded", "false");
  tutorialPanel?.setAttribute("aria-hidden", "true");
}

menuToggle?.addEventListener("click", () => {
  body.classList.add("menu-open");
  body.classList.remove("cart-open");
});

menuClose?.addEventListener("click", () => {
  body.classList.remove("menu-open");
});

menuOverlay?.addEventListener("click", () => {
  body.classList.remove("menu-open");
});

cartToggle?.addEventListener("click", () => {
  body.classList.add("cart-open");
  body.classList.remove("menu-open");
});

cartClose?.addEventListener("click", () => {
  body.classList.remove("cart-open");
});

cartOverlay?.addEventListener("click", () => {
  body.classList.remove("cart-open");
});

tutorialToggle?.addEventListener("click", () => {
  body.classList.add("tutorial-open");
  body.classList.remove("menu-open", "cart-open", "customizer-open");
  tutorialToggle.setAttribute("aria-expanded", "true");
  tutorialPanel?.setAttribute("aria-hidden", "false");
  document.getElementById("customizerToggle")?.setAttribute("aria-expanded", "false");
  document.getElementById("customizerPanel")?.setAttribute("aria-hidden", "true");
});

tutorialClose?.addEventListener("click", closeTutorial);
tutorialOverlay?.addEventListener("click", closeTutorial);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    body.classList.remove("menu-open");
    body.classList.remove("cart-open");
    body.classList.remove("customizer-open");
    closeTutorial();
  }
});
