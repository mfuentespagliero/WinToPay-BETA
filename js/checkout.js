const SHIPPING_PRICES = {
  normal: 4990,
  express: 7990,
  pickup: 0,
};

function parseMoney(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const clean = String(value).replace(/[^\d]/g, "");
  return Number(clean) || 0;
}

function formatCLP(value) {
  return "$" + Number(value || 0).toLocaleString("es-CL");
}

function getCart() {
  const possibleKeys = ["cart", "wintopay-cart", "wintopayCart", "carrito"];
  for (const key of possibleKeys) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return [];
}

function normalizeItem(item) {
  return {
    title: item.title || item.name || item.product || "Producto",
    price: parseMoney(item.price),
    qty: Number(item.qty || item.quantity || 1),
    size: item.size || item.talla || "Única",
    image: item.image || item.img || item.src || "assets/img/producto-1.jpg",
  };
}

function renderSummary() {
  const itemsWrap = document.getElementById("summaryItems");
  const subtotalEl = document.getElementById("summarySubtotal");
  const shippingEl = document.getElementById("summaryShipping");
  const totalEl = document.getElementById("summaryTotal");

  const cart = getCart().map(normalizeItem);

  if (!cart.length) {
    itemsWrap.innerHTML = `
      <div class="summary-empty">
        <p>Tu carrito está vacío.</p>
      </div>
    `;
    subtotalEl.textContent = formatCLP(0);
    shippingEl.textContent = formatCLP(SHIPPING_PRICES.normal);
    totalEl.textContent = formatCLP(SHIPPING_PRICES.normal);
    return;
  }

  itemsWrap.innerHTML = cart.map((item) => `
    <article class="summary-item">
      <div class="summary-thumb-wrap">
        <img src="${item.image}" alt="${item.title}">
        <span class="summary-qty">${item.qty}</span>
      </div>

      <div class="summary-copy">
        <strong>${item.title}</strong>
        <span>Talla: ${item.size}</span>
      </div>

      <div class="summary-price">${formatCLP(item.price * item.qty)}</div>
    </article>
  `).join("");

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const selectedShipping = document.querySelector('input[name="shipping"]:checked')?.value || "normal";
  const shippingCost = SHIPPING_PRICES[selectedShipping] ?? 0;
  const total = subtotal + shippingCost;

  subtotalEl.textContent = formatCLP(subtotal);
  shippingEl.textContent = formatCLP(shippingCost);
  totalEl.textContent = formatCLP(total);
}

document.querySelectorAll('input[name="shipping"]').forEach((radio) => {
  radio.addEventListener("change", renderSummary);
});

document.getElementById("checkoutForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Pedido confirmado. Aquí después conectamos la pasarela.");
});

renderSummary();

