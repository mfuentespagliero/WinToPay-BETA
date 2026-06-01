function initCheckoutPayment() {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const cardPanel = document.getElementById("cardPaymentPanel");

  if (!paymentRadios.length || !cardPanel) return;

  function updatePaymentUI() {
    const selected = document.querySelector('input[name="payment"]:checked')?.value;

    document.querySelectorAll(".payment-card-option").forEach((el) => {
      el.classList.remove("is-selected");
    });

    if (selected === "card") {
      cardPanel.style.display = "flex";
      document.querySelector(".payment-card-option")?.classList.add("is-selected");
    } else {
      cardPanel.style.display = "none";
    }
  }

  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", updatePaymentUI);
  });

  updatePaymentUI();
}

document.addEventListener("DOMContentLoaded", initCheckoutPayment);

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const clean = value.replace(/\D/g, "").slice(0, 4);
  if (clean.length < 3) return clean;
  return clean.slice(0, 2) + "/" + clean.slice(2);
}

document.addEventListener("DOMContentLoaded", () => {
  const cardNumber = document.getElementById("cardNumber");
  const cardExpiry = document.getElementById("cardExpiry");
  const cardCvv = document.getElementById("cardCvv");

  cardNumber?.addEventListener("input", () => {
    cardNumber.value = formatCardNumber(cardNumber.value);
  });

  cardExpiry?.addEventListener("input", () => {
    cardExpiry.value = formatExpiry(cardExpiry.value);
  });

  cardCvv?.addEventListener("input", () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
  });
});