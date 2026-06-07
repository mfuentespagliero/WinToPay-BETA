/* =========================================================
   APP.JS
========================================================= */

/* ── Checkout: pago ───────────────────────────────────── */
function initCheckoutPayment() {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const cardPanel     = document.getElementById("cardPaymentPanel");
  if (!paymentRadios.length || !cardPanel) return;

  function updatePaymentUI() {
    const selected = document.querySelector('input[name="payment"]:checked')?.value;
    document.querySelectorAll(".payment-card-option")
      .forEach(el => el.classList.remove("is-selected"));

    if (selected === "card") {
      cardPanel.style.display = "flex";
      document.querySelector(".payment-card-option")?.classList.add("is-selected");
    } else {
      cardPanel.style.display = "none";
    }
  }

  paymentRadios.forEach(r => r.addEventListener("change", updatePaymentUI));
  updatePaymentUI();
}

/* ── Checkout: formato campos ─────────────────────────── */
function initCheckoutFields() {
  const cardNumber = document.getElementById("cardNumber");
  const cardExpiry = document.getElementById("cardExpiry");
  const cardCvv    = document.getElementById("cardCvv");

  cardNumber?.addEventListener("input", () => {
    cardNumber.value = cardNumber.value
      .replace(/\D/g, "").slice(0, 16)
      .replace(/(.{4})/g, "$1 ").trim();
  });

  cardExpiry?.addEventListener("input", () => {
    const clean = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
    cardExpiry.value = clean.length < 3 ? clean : clean.slice(0, 2) + "/" + clean.slice(2);
  });

  cardCvv?.addEventListener("input", () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
  });
}

/* ── Galería: hover desktop + swipe mobile ────────────── */
function initGalleries() {
  document.querySelectorAll(".product-gallery").forEach((gallery) => {
    if (gallery._init) return;
    gallery._init = true;

    const images = gallery.querySelectorAll("img");
    if (images.length <= 1) return;

    const media   = gallery.closest(".product-media");
    let current   = 0;
    let interval  = null;

    function goTo(index) {
      current = Math.max(0, Math.min(index, images.length - 1));
      gallery.style.transition = "transform 0.3s ease";
      gallery.style.transform  = `translateX(-${current * 100}%)`;
    }

    /* Desktop: hover rota imágenes */
/* Desktop: hover muestra segunda imagen instantáneamente */
media?.addEventListener("mouseenter", () => {
  if (window.innerWidth <= 900) return;
  gallery.style.transition = "none";
  goTo(1);
});

media?.addEventListener("mouseleave", () => {
  if (window.innerWidth <= 900) return;
  gallery.style.transition = "none";
  goTo(0);
});

    /* Mobile: swipe táctil */
    let x0 = 0, xNow = 0, swiping = false;

    gallery.addEventListener("touchstart", (e) => {
      if (window.innerWidth > 900) return;
      x0      = e.touches[0].clientX;
      xNow    = x0;
      swiping = true;
      gallery.style.transition = "none";
    }, { passive: true });

    gallery.addEventListener("touchmove", (e) => {
      if (!swiping || window.innerWidth > 900) return;
      xNow = e.touches[0].clientX;
      const drag = xNow - x0;
      gallery.style.transform = `translateX(${-(current * gallery.offsetWidth) + drag}px)`;
    }, { passive: true });

    gallery.addEventListener("touchend", () => {
      if (!swiping || window.innerWidth > 900) return;
      swiping = false;
      const diff = xNow - x0;
      const snap = gallery.offsetWidth * 0.25;
      if      (diff < -snap) goTo(current + 1);
      else if (diff >  snap) goTo(current - 1);
      else                   goTo(current);
    });
  });
}

/* ── Locks ────────────────────────────────────────────── */
function updateCatalogLocks(finalTime) {
  document.querySelectorAll(".product-card[data-threshold]").forEach((card) => {
    const unlocked = finalTime < Number(card.dataset.threshold);
    card.classList.toggle("unlocked",  unlocked);
    card.classList.toggle("locked",   !unlocked);
  });
}

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initCheckoutPayment();
  initCheckoutFields();
  initGalleries();

  const storedTime = Number(localStorage.getItem("wintopayFinalTime"));
  if (storedTime > 0) updateCatalogLocks(storedTime);
});