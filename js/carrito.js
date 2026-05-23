/* =========================================================
   CARRITO.JS
   - Selector de talla en card antes de agregar
   - Badge de cantidad en ícono del carro
   - Items con foto en el drawer
   - Eliminar items
   - Total actualizado
   - Persiste en localStorage
========================================================= */

const STORAGE_KEY = "wintopay_cart";
const SIZES = ["S", "M", "L", "XL"];

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

// ── Lógica del carrito ────────────────────────────────────

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

function getTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getTotalQty(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ── Badge en ícono del carro ──────────────────────────────

function updateBadge() {
  const cart = getCart();
  const qty  = getTotalQty(cart);

  document.querySelectorAll(".cart-toggle").forEach(btn => {
    let badge = btn.querySelector(".cart-badge");

    if (qty === 0) {
      if (badge) badge.remove();
      return;
    }

    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      btn.appendChild(badge);
    }

    badge.textContent = qty > 99 ? "99+" : qty;
  });
}

// ── Render del drawer ─────────────────────────────────────

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

function formatPrice(value) {
  return "$" + value.toLocaleString("es-CL");
}

function parsePrice(text) {
  return parseInt(text.replace(/\D/g, ""), 10) || 0;
}

// ── Abrir carrito ─────────────────────────────────────────

function openCart() {
  document.body.classList.add("cart-open");
  document.body.classList.remove("menu-open");
}

// ── Selector de talla en card ─────────────────────────────

function showSizeSelector(button, card) {
  const existing = card.querySelector(".size-selector");
  if (existing) {
    existing.remove();
    return;
  }

  document.querySelectorAll(".size-selector").forEach(el => el.remove());

  const title = card.querySelector(".card-title")?.textContent.trim();
  const price = parsePrice(card.querySelector(".card-price")?.textContent || "0");
  const image = card.querySelector("img")?.src || "";

  const selector = document.createElement("div");
  selector.className = "size-selector";
  selector.innerHTML = `
    <span class="size-label">Talla</span>
    <div class="size-options">
      ${SIZES.map(s => `<button class="size-btn" data-size="${s}">${s}</button>`).join("")}
    </div>
  `;

  const media = card.querySelector(".product-media");
  media.insertAdjacentElement("afterend", selector);

  selector.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addItem(title, price, btn.dataset.size, image);
      selector.remove();
    });
  });

  setTimeout(() => {
    document.addEventListener("click", function handler(e) {
      if (!selector.contains(e.target) && e.target !== button) {
        selector.remove();
        document.removeEventListener("click", handler);
      }
    });
  }, 0);
}

// ── Botones + en cards ────────────────────────────────────

document.querySelectorAll(".product-add").forEach(button => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const card = button.closest(".product-card");
    showSizeSelector(button, card);
  });
});

// ── Botón "Agregar al carro" en página de detalle ─────────

const addFromDetail = document.querySelector(".product-actions .btn");
if (addFromDetail) {
  addFromDetail.addEventListener("click", (e) => {
    e.preventDefault();

    const title = document.querySelector(".product-info .product-title")?.textContent.trim();
    const price = parsePrice(document.querySelector(".product-info .product-price")?.textContent || "0");
    const image = document.querySelector(".product-gallery img")?.src || "";

    if (!title) return;

    const actions  = document.querySelector(".product-actions");
    const existing = actions.querySelector(".size-selector");
    if (existing) { existing.remove(); return; }

    const selector = document.createElement("div");
    selector.className = "size-selector";
    selector.innerHTML = `
      <span class="size-label">Talla</span>
      <div class="size-options">
        ${SIZES.map(s => `<button class="size-btn" data-size="${s}">${s}</button>`).join("")}
      </div>
    `;

    actions.insertAdjacentElement("afterend", selector);

    selector.querySelectorAll(".size-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        addItem(title, price, btn.dataset.size, image);
        selector.remove();
      });
    });
  });
}

// ── Inicializar ───────────────────────────────────────────

renderCart();
updateBadge();