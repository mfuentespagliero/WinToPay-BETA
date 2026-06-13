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

function updateCatalogLocks(finalTime) {
  document.querySelectorAll(".product-card[data-threshold]").forEach((card) => {
    const threshold = Number(card.dataset.threshold);
    const unlocked = finalTime <= 20 && finalTime < threshold;
    card.classList.toggle("unlocked", unlocked);
    card.classList.toggle("locked", !unlocked);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initGalleries();

  const storedTime = Number(localStorage.getItem("wintopayFinalTime"));
  if (storedTime > 0) updateCatalogLocks(storedTime);
});
