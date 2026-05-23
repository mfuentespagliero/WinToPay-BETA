const body = document.body;

const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const menuOverlay = document.querySelector(".menu-overlay");

const cartToggle = document.querySelector(".cart-toggle");
const cartClose = document.querySelector(".cart-close");
const cartOverlay = document.querySelector(".cart-overlay");

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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    body.classList.remove("menu-open");
    body.classList.remove("cart-open");
  }
});