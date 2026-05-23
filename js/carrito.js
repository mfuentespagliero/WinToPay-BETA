
  document.querySelectorAll(".product-add").forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const card = button.closest(".product-card");
      const title = card.querySelector(".product-title").textContent.trim();

      console.log("Agregar al carro:", title);

      // Aquí luego metemos tu lógica real del carrito
      alert(title + " agregado al carro");
    });
  });
