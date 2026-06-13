const SHIPPING_PRICES = {
  normal: 4990,
  express: 7990,
  pickup: 0,
};
const CART_STORAGE_KEY = "wintopay_cart";

function parseMoney(value) {
  if (typeof value === "number") return value;
  return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
}

function formatCLP(value) {
  return "$" + Number(value || 0).toLocaleString("es-CL");
}

function getCheckoutCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeItem(item) {
  return {
    title: item.title || "Producto",
    price: parseMoney(item.price),
    qty: Number(item.qty || 1),
    size: item.size || "Única",
    image: item.image || "",
  };
}

function renderSummary() {
  const itemsWrap = document.getElementById("summaryItems");
  const subtotalEl = document.getElementById("summarySubtotal");
  const shippingEl = document.getElementById("summaryShipping");
  const totalEl = document.getElementById("summaryTotal");
  if (!itemsWrap || !subtotalEl || !shippingEl || !totalEl) return;

  const cart = getCheckoutCart().map(normalizeItem);
  const selectedShipping = document.querySelector('input[name="shipping"]:checked')?.value || "normal";
  const shippingCost = SHIPPING_PRICES[selectedShipping] ?? 0;
  const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);

  itemsWrap.innerHTML = cart.length
    ? cart.map((item) => `
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
    `).join("")
    : '<div class="summary-empty"><p>Tu carrito está vacío.</p></div>';

  subtotalEl.textContent = formatCLP(subtotal);
  shippingEl.textContent = formatCLP(shippingCost);
  totalEl.textContent = formatCLP(subtotal + shippingCost);
}

function initPaymentOptions() {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const cardPanel = document.getElementById("cardPaymentPanel");
  if (!paymentRadios.length || !cardPanel) return;

  function updatePaymentUI() {
    const isCard = document.querySelector('input[name="payment"]:checked')?.value === "card";
    document.querySelector(".payment-card-option")?.classList.toggle("is-selected", isCard);
    cardPanel.hidden = !isCard;
  }

  paymentRadios.forEach((radio) => radio.addEventListener("change", updatePaymentUI));
  updatePaymentUI();
}

function initCardFields() {
  const cardNumber = document.getElementById("cardNumber");
  const cardExpiry = document.getElementById("cardExpiry");
  const cardCvv = document.getElementById("cardCvv");

  cardNumber?.addEventListener("input", () => {
    cardNumber.value = cardNumber.value
      .replace(/\D/g, "").slice(0, 16)
      .replace(/(.{4})/g, "$1 ").trim();
  });

  cardExpiry?.addEventListener("input", () => {
    const clean = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
    cardExpiry.value = clean.length < 3 ? clean : `${clean.slice(0, 2)}/${clean.slice(2)}`;
  });

  cardCvv?.addEventListener("input", () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
  });
}

document.querySelectorAll('input[name="shipping"]')
  .forEach((radio) => radio.addEventListener("change", renderSummary));

document.getElementById("checkoutForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Pedido confirmado. Aquí después conectamos la pasarela.");
});

initPaymentOptions();
initCardFields();
renderSummary();
