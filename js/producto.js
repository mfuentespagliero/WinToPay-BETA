document.querySelectorAll(".thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    document.querySelectorAll(".thumb").forEach((item) => item.classList.remove("active"));
    thumb.classList.add("active");
    document.getElementById("mainImage").src = thumb.dataset.img;
  });
});

let selectedSize = null;

document.querySelectorAll(".product-sizes .size-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".product-sizes .size-btn")
      .forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedSize = button.dataset.size;
  });
});

document.getElementById("addToCartBtn")?.addEventListener("click", () => {
  if (!selectedSize) {
    alert("Por favor elige una talla.");
    return;
  }

  const title = document.querySelector(".product-info .product-title").textContent.trim();
  const price = parsePrice(document.querySelector(".product-info .product-price").textContent);
  const image = document.getElementById("mainImage").src;
  addItem(title, price, selectedSize, image);
});
