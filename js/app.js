/* Shared product-card behavior. */

function initGalleries() {
  document.querySelectorAll(".product-gallery").forEach((gallery) => {
    if (gallery.dataset.initialized === "true") return;
    gallery.dataset.initialized = "true";

    const images = gallery.querySelectorAll("img");
    const media = gallery.closest(".product-media");
    if (images.length <= 1 || !media) return;

    function goTo(index, behavior = "smooth") {
      gallery.scrollTo({
        left: index * gallery.clientWidth,
        behavior,
      });
    }

    media.addEventListener("mouseenter", () => {
      if (window.innerWidth > 900) goTo(1, "instant");
    });

    media.addEventListener("mouseleave", () => {
      if (window.innerWidth > 900) goTo(0, "instant");
    });

    window.addEventListener("resize", () => gallery.scrollTo({ left: 0 }));
  });
}

function protectLockedCardLinks() {
  document.querySelectorAll(".product-card .product-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.closest(".product-card")?.classList.contains("locked")) {
        event.preventDefault();
      }
    });
  });
}

function updateCatalogLocks(finalTime) {
  document.querySelectorAll(".product-card[data-threshold]").forEach((card) => {
    const threshold = Number(card.dataset.threshold);
    const unlocked = finalTime > 0 && finalTime <= threshold;
    card.classList.toggle("unlocked", unlocked);
    card.classList.toggle("locked", !unlocked);
    card.querySelector(".product-add")?.toggleAttribute("disabled", !unlocked);

    const lockLabel = card.querySelector(".lock-label");
    if (lockLabel) {
      lockLabel.textContent = `Completa en ${formatChallengeTime(threshold)}`;
    }

    const note = card.querySelector(".product-note");
    if (note) {
      note.textContent = unlocked
        ? `Desbloqueado con tu mejor tiempo: ${formatChallengeTime(finalTime)}.`
        : `Completa el juego en ${formatChallengeTime(threshold)} o menos.`;
    }
  });
}

function formatChallengeTime(seconds) {
  if (seconds >= 60 && seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }

  return `${seconds} segundos`;
}

document.addEventListener("DOMContentLoaded", () => {
  initGalleries();
  protectLockedCardLinks();

  const storedTime = Number(localStorage.getItem("wintopayFinalTime"));
  updateCatalogLocks(storedTime);
});
