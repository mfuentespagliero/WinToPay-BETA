const customizerToggle = document.getElementById("customizerToggle");
const customizerClose = document.getElementById("customizerClose");
const customizerOverlay = document.getElementById("customizerOverlay");
const customizerPanel = document.getElementById("customizerPanel");
const CUSTOMIZER_STORAGE_KEY = "wintopay_minesweeper_skins";

function getStoredCustomizerState() {
  try {
    const storedState = JSON.parse(localStorage.getItem(CUSTOMIZER_STORAGE_KEY));
    return {
      face: ["classic", "alien", "dog"].includes(storedState?.face) ? storedState.face : "classic",
      mine: ["classic", "cow", "poop"].includes(storedState?.mine) ? storedState.mine : "classic",
    };
  } catch {
    return {
      face: "classic",
      mine: "classic",
    };
  }
}

const customizerState = getStoredCustomizerState();

function applyCustomizerState() {
  document.body.dataset.faceSkin = customizerState.face;
  document.body.dataset.mineSkin = customizerState.mine;
  localStorage.setItem(CUSTOMIZER_STORAGE_KEY, JSON.stringify(customizerState));
}

function syncCustomizerControls() {
  document.querySelectorAll("[data-customizer-target]").forEach((group) => {
    const selectedValue = customizerState[group.dataset.customizerTarget];

    group.querySelectorAll("[data-option]").forEach((item) => {
      const isSelected = item.dataset.option === selectedValue;
      item.classList.toggle("active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
  });
}

function openCustomizer() {
  document.body.classList.add("customizer-open");
  document.body.classList.remove("menu-open", "cart-open", "tutorial-open");
  customizerToggle?.setAttribute("aria-expanded", "true");
  customizerPanel?.setAttribute("aria-hidden", "false");
  document.getElementById("tutorialToggle")?.setAttribute("aria-expanded", "false");
  document.getElementById("tutorialPanel")?.setAttribute("aria-hidden", "true");
}

function closeCustomizer() {
  document.body.classList.remove("customizer-open");
  customizerToggle?.setAttribute("aria-expanded", "false");
  customizerPanel?.setAttribute("aria-hidden", "true");
}

function selectCustomizerOption(group, option) {
  group.querySelectorAll("[data-option]").forEach((item) => {
    const isSelected = item === option;
    item.classList.toggle("active", isSelected);
    item.setAttribute("aria-pressed", String(isSelected));
  });

  const target = group.dataset.customizerTarget;
  customizerState[target] = option.dataset.option;
  applyCustomizerState();
}

customizerToggle?.addEventListener("click", openCustomizer);
customizerClose?.addEventListener("click", closeCustomizer);
customizerOverlay?.addEventListener("click", closeCustomizer);

document.querySelectorAll("[data-customizer-target]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const option = event.target.closest("[data-option]");
    if (!option || !group.contains(option)) return;
    selectCustomizerOption(group, option);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCustomizer();
});

syncCustomizerControls();
applyCustomizerState();
