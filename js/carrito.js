/* =========================================================
   CARRITO.JS
========================================================= */

const STORAGE_KEY = "wintopay_cart";

// ── Leer / guardar ────────────────────────────────────────

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// ── Lógica ────────────────────────────────────────────────

function addItem(title, price, size, image) {
  const cart = getCart();
  const key = `${title}__${size}`;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ key, title, price, size, image, qty: 1 });
  }

  saveCart(cart);
  renderCart();
  updateBadge();
  openCart();
}

function removeItem(key) {
  const cart = getCart().filter(item => item.key !== key);
  saveCart(cart);
  renderCart();
  updateBadge();
}

function getTotal(cart)    { return cart.reduce((sum, i) => sum + i.price * i.qty, 0); }
function getTotalQty(cart) { return cart.reduce((sum, i) => sum + i.qty, 0); }
function formatPrice(v)    { return "$" + v.toLocaleString("es-CL"); }
function parsePrice(text)  { return parseInt((text || "").replace(/\D/g, ""), 10) || 0; }

// ── Badge ─────────────────────────────────────────────────

function updateBadge() {
  const qty = getTotalQty(getCart());
  document.querySelectorAll(".cart-toggle").forEach(btn => {
    let badge = btn.querySelector(".cart-badge");
    if (qty === 0) { if (badge) badge.remove(); return; }
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      btn.appendChild(badge);
    }
    badge.textContent = qty > 99 ? "99+" : qty;
  });
}

// ── Render drawer ─────────────────────────────────────────

function renderCart() {
  const cart    = getCart();
  const body    = document.querySelector(".cart-body");
  const totalEl = document.querySelector(".cart-total strong");
  if (!body || !totalEl) return;

  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-empty">Tu carro está vacío.</p>';
    totalEl.textContent = "$0";
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="cart-item-info">
        <strong class="cart-item-title">${item.title}</strong>
        <span class="cart-item-size">Talla: ${item.size}</span>
        <span class="cart-item-qty">x${item.qty}</span>
        <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
      </div>
      <button class="cart-item-remove" data-key="${item.key}" aria-label="Eliminar ${item.title}">✕</button>
    </div>
  `).join("");

  body.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => removeItem(btn.dataset.key));
  });

  totalEl.textContent = formatPrice(getTotal(cart));
}

function openCart() {
  document.body.classList.add("cart-open");
  document.body.classList.remove("menu-open");
}

// ── Cards: botón + abre/cierra overlay ───────────────────

document.querySelectorAll(".product-add").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest(".product-card");
    if (!card) return;

    // Cerrar otras cards abiertas
    document.querySelectorAll(".product-card.show-sizes").forEach(c => {
      if (c !== card) c.classList.remove("show-sizes");
    });

    card.classList.toggle("show-sizes");
  });
});

// ── Cards: botones de talla en el overlay ─────────────────

document.querySelectorAll(".product-card .size-overlay .size-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest(".product-card");
    if (!card) return;

    const title = card.querySelector(".product-body .product-title")?.textContent.trim() || "Producto";
    const price = parsePrice(card.querySelector(".price-current")?.textContent || "0");
    const image = card.querySelector("img")?.src || "";
    const size  = btn.dataset.size || btn.textContent.trim();

    addItem(title, price, size, image);
    card.classList.remove("show-sizes");
  });
});

// Cerrar overlay al clickear fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".product-card")) {
    document.querySelectorAll(".product-card.show-sizes")
      .forEach(c => c.classList.remove("show-sizes"));
  }
});

// ── Página de detalle ─────────────────────────────────────

const addFromDetail = document.querySelector(".product-actions .btn");
if (addFromDetail) {
  addFromDetail.addEventListener("click", (e) => {
    e.preventDefault();

    const title = document.querySelector(".product-info .product-title")?.textContent.trim();
    const price = parsePrice(document.querySelector(".product-info .product-price")?.textContent || "0");
    const image = document.querySelector(".product-gallery img")?.src || "";
    if (!title) return;

    const actions  = document.querySelector(".product-actions");
    const existing = document.querySelector(".detail-size-selector");
    if (existing) { existing.remove(); return; }

    const selector = document.createElement("div");
    selector.className = "size-selector detail-size-selector";
    selector.innerHTML = `
      <span class="size-label">Talla</span>
      <div class="size-options">
        ${["S","M","L","XL"].map(s =>
          `<button type="button" class="size-btn" data-size="${s}">${s}</button>`
        ).join("")}
      </div>
    `;

    actions.insertAdjacentElement("afterend", selector);

    selector.querySelectorAll(".size-btn").forEach(b => {
      b.addEventListener("click", () => {
        addItem(title, price, b.dataset.size, image);
        selector.remove();
      });
    });
  });
}

// ── Init ──────────────────────────────────────────────────

renderCart();
updateBadge();

const checkoutButton = document.querySelector(".cart-checkout");

checkoutButton?.addEventListener("click", () => {
  window.location.href = "checkout.html";
});

