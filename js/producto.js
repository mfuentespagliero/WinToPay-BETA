const PRODUCTS = {
  "calcetines": {
    title: "Calcetines WinToPay",
    threshold: 300,
    oldPrice: "$24.990",
    price: "$18.990",
    images: ["assets/Items Wintopay v1/calcetines1.jpg", "assets/Items Wintopay v1/calcetines2.jpg"],
  },
  "celular": {
    title: "Carcasa WinToPay",
    threshold: 120,
    oldPrice: "$24.990",
    price: "$18.990",
    images: ["assets/Items Wintopay v1/Celu1.jpg", "assets/Items Wintopay v1/celu2.jpg"],
  },
  "gorra": {
    title: "Gorra WinToPay",
    threshold: 60,
    oldPrice: "$39.990",
    price: "$29.990",
    images: ["assets/Items Wintopay v1/gorra1.jpg", "assets/Items Wintopay v1/gorra2.jpg"],
  },
  "polera": {
    title: "Polera WinToPay",
    threshold: 30,
    oldPrice: "$42.990",
    price: "$31.990",
    images: ["assets/Items Wintopay v1/polera1.jpg", "assets/Items Wintopay v1/polera2.jpg"],
  },
  "poleron": {
    title: "Polerón WinToPay",
    threshold: 25,
    oldPrice: "$29.990",
    price: "$21.990",
    images: ["assets/Items Wintopay v1/poleron1.jpg", "assets/Items Wintopay v1/poleron2.jpg"],
  },
  "taza": {
    title: "Taza WinToPay",
    threshold: 20,
    oldPrice: "$34.990",
    price: "$24.990",
    images: ["assets/Items Wintopay v1/taza1.jpg", "assets/Items Wintopay v1/taza2.jpg"],
  },
};

const productId = new URLSearchParams(window.location.search).get("id") || "calcetines";
const product = PRODUCTS[productId] || PRODUCTS["calcetines"];
const bestTime = Number(localStorage.getItem("wintopayFinalTime"));
const isUnlocked = bestTime > 0 && bestTime <= product.threshold;
const productPage = document.querySelector(".product-page");
const detail = document.querySelector("[data-product-detail]");
const mainImage = document.getElementById("mainImage");
const addButton = document.getElementById("addToCartBtn");

function renderProduct() {
  document.title = `${product.title} | WinToPay`;
  document.querySelector(".product-info .product-title").textContent = product.title;
  document.querySelector(".product-info .product-price-old").textContent = product.oldPrice;
  document.querySelector(".product-info .product-price").textContent = product.price;
  mainImage.src = product.images[0];
  mainImage.alt = product.title;

  document.querySelector(".gallery-thumbs").innerHTML = product.images.map((image, index) => `
    <button class="thumb${index === 0 ? " active" : ""}" type="button" data-img="${image}">
      <img src="${image}" alt="${product.title} vista ${index + 1}">
    </button>
  `).join("");

  productPage.classList.toggle("product-unlocked", isUnlocked);
  productPage.classList.toggle("product-locked", !isUnlocked);
  detail.dataset.threshold = product.threshold;
  addButton.disabled = !isUnlocked;

  document.querySelectorAll(".product-sizes .size-btn, .gallery-thumbs .thumb")
    .forEach((button) => button.disabled = !isUnlocked);

  document.querySelector(".product-info .product-meta").textContent = isUnlocked
    ? `Desbloqueado con tu mejor tiempo: ${formatChallengeTime(bestTime)}`
    : "Producto bloqueado por rendimiento en el juego";

  document.getElementById("productLockMessage").textContent =
    `Completa el buscaminas en ${formatChallengeTime(product.threshold)} o menos para desbloquearlo.`;
}

function initThumbs() {
  document.querySelectorAll(".thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (!isUnlocked) return;
      document.querySelectorAll(".thumb").forEach((item) => item.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.dataset.img;
    });
  });
}

let selectedSize = null;

function initSizes() {
  document.querySelectorAll(".product-sizes .size-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isUnlocked) return;
      document.querySelectorAll(".product-sizes .size-btn")
        .forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      selectedSize = button.dataset.size;
    });
  });
}

addButton?.addEventListener("click", () => {
  if (!isUnlocked) return;

  if (!selectedSize) {
    alert("Por favor elige una talla.");
    return;
  }

  addItem(product.title, parsePrice(product.price), selectedSize, mainImage.src);
});

renderProduct();
initThumbs();
initSizes();
