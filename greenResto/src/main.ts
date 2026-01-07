import { products } from "./data/products.js";
import { CartItem } from "./types/index.js";
import { addToCart } from "./utils/cart.js";

// Application state
let cart: CartItem[] = [];

// Format category name for display
function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    "Creme Brulee": "Crème Brûlée",
    "Panna Cotta": "Panna Cotta"
  };
  return categoryMap[category] || category;
}

// Initialize the application
function init(): void {
  renderDesserts();
  renderCart();
}

// Render dessert cards
function renderDesserts(): void {
  const dessertsSection = document.getElementById("desserts-section");
  if (!dessertsSection) return;

  dessertsSection.innerHTML = products
    .map((dessert : any) => {
      const cartItem = cart.find((item) => item.dessert.id === dessert.id);
      const isInCart = cartItem !== undefined;
      const quantity = cartItem?.quantity ?? 0;

      // Use formatted category as short name, name as description
      const shortName = formatCategoryName(dessert.category);
      const fullDescription = dessert.name;

      return `
    <div class="dessert-card">
      <picture>
        <source media="(min-width: 1024px)" srcset="${dessert.image.desktop}">
        <source media="(min-width: 768px)" srcset="${dessert.image.tablet}">
        <img 
          src="${dessert.image.mobile}" 
          alt="${dessert.name}" 
          class="dessert-card__image ${isInCart ? "selected" : ""}"
          loading="lazy"
        >
      </picture>
      <div class="dessert-card__content">
        <h3 class="dessert-card__name">${shortName}</h3>
        <p class="dessert-card__description">${fullDescription}</p>
        <div class="dessert-card__footer">
          <span class="dessert-card__price">$${dessert.price.toFixed(2)}</span>
          ${
            isInCart
              ? `
          <div class="quantity-selector">
            <button class="quantity-btn" data-action="decrement" data-dessert-id="${dessert.id}">-</button>
            <span class="quantity-value">${quantity}</span>
            <button class="quantity-btn" data-action="increment" data-dessert-id="${dessert.id}">+</button>
          </div>
          `
              : `
          <button 
            class="btn btn--primary" 
            data-dessert-id="${dessert.id}"
            ${!dessert.inStock ? "disabled" : ""}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H3.5L4.5 10H13L14 2H2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="6" cy="13" r="1" fill="currentColor"/>
              <circle cx="12" cy="13" r="1" fill="currentColor"/>
            </svg>
            Add to Cart
          </button>
          `
          }
        </div>
      </div>
    </div>
  `;
    })
    .join("");

  // Add event listeners to buttons
  dessertsSection.querySelectorAll(".btn--primary").forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      const dessertId = target.getAttribute("data-dessert-id");
      if (dessertId) {
        const dessert = products.find((d : any) => d.id === dessertId);
        if (dessert) {
          cart = addToCart(cart, dessert, 1);
          renderDesserts();
          renderCart();
        }
      }
    });
  });

  // Add event listeners to quantity buttons in dessert cards
  dessertsSection.querySelectorAll(".quantity-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      const action = target.getAttribute("data-action");
      const dessertId = target.getAttribute("data-dessert-id");
      if (dessertId && action) {
        const dessert = products.find((d : any) => d.id === dessertId);
        if (dessert) {
          if (action === "increment") {
            cart = addToCart(cart, dessert, 1);
          } else if (action === "decrement") {
            const item = cart.find((item) => item.dessert.id === dessertId);
            if (item && item.quantity > 1) {
              cart = cart.map((cartItem) =>
                cartItem.dessert.id === dessertId
                  ? { ...cartItem, quantity: cartItem.quantity - 1 }
                  : cartItem
              );
            } else if (item && item.quantity === 1) {
              cart = cart.filter((item) => item.dessert.id !== dessertId);
            }
          }
          renderDesserts();
          renderCart();
        }
      }
    });
  });
}

// Calculate total
function calculateTotal(): number {
  return cart.reduce((total, item) => total + item.dessert.price * item.quantity, 0);
}

// Render cart
function renderCart(): void {
  const cartSection = document.getElementById("cart-section");
  const cartContent = document.getElementById("cart-content");
  if (!cartSection || !cartContent) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTitle = cartSection.querySelector(".cart__title");
  if (cartTitle) {
    cartTitle.textContent = `Your Cart (${totalItems})`;
  }

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block; opacity: 0.3;">
          <path d="M60 20L40 50H80L60 20Z" fill="#D8C4B6"/>
          <path d="M30 60L50 90L70 90L90 60H30Z" fill="#8B7362"/>
        </svg>
        <p style="margin-top: 16px;">Your added items will appear here</p>
      </div>
    `;
    return;
  }

  const total = calculateTotal();

  cartContent.innerHTML = `
    ${cart
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.dessert.name}</div>
          <div class="cart-item__details-row">
            <span class="cart-item__quantity-text">${item.quantity}x @ $${item.dessert.price.toFixed(2)}</span>
            <span class="cart-item__total">$${(item.dessert.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
        <button class="cart-item__remove" data-dessert-id="${item.dessert.id}" aria-label="Remove item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `
      )
      .join("")}
    <div class="cart-total">
      <div class="cart-total__label">Order Total</div>
      <div class="cart-total__amount">$${total.toFixed(2)}</div>
    </div>
    <div class="cart-carbon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z" fill="#9ACD32"/>
      </svg>
      <span>This is a carbon-neutral delivery</span>
    </div>
    <button class="btn btn--confirm" id="confirm-order-btn">Confirm Order</button>
  `;

  // Add event listener to confirm order button
  const confirmBtn = cartContent.querySelector("#confirm-order-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      showOrderConfirmation();
    });
  }

  // Add event listeners to remove buttons
  cartContent.querySelectorAll(".cart-item__remove").forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const removeBtn = target.closest(".cart-item__remove") as HTMLButtonElement;
      const dessertId = removeBtn.getAttribute("data-dessert-id");
      if (dessertId) {
        cart = cart.filter((item) => item.dessert.id !== dessertId);
        renderDesserts();
        renderCart();
      }
    });
  });
}

// Show order confirmation modal
function showOrderConfirmation(): void {
  const modal = document.getElementById("order-modal");
  const modalContent = document.getElementById("modal-content");
  if (!modal || !modalContent) return;

  const total = calculateTotal();

  modalContent.innerHTML = `
    <div class="modal__order-items">
      ${cart
        .map(
          (item) => `
        <div class="modal__order-item">
          <img 
            src="${item.dessert.image.thumbnail}" 
            alt="${item.dessert.name}" 
            class="modal__order-item-image"
          >
          <div class="modal__order-item-info">
            <div class="modal__order-item-name">${item.dessert.name}</div>
            <div class="modal__order-item-details">
              <span>${item.quantity}x @ $${item.dessert.price.toFixed(2)}</span>
              <span class="modal__order-item-price">$${(item.dessert.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="modal__order-total">
      <span class="modal__order-total-label">Order Total</span>
      <span class="modal__order-total-amount">$${total.toFixed(2)}</span>
    </div>
    <button class="btn btn--new-order" id="start-new-order-btn">Start New Order</button>
  `;

  modal.style.display = "flex";

  // Add event listener to start new order button
  const newOrderBtn = modalContent.querySelector("#start-new-order-btn");
  if (newOrderBtn) {
    newOrderBtn.addEventListener("click", () => {
      closeOrderModal();
    });
  }

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeOrderModal();
    }
  });
}

// Close order modal and reset cart
function closeOrderModal(): void {
  const modal = document.getElementById("order-modal");
  if (modal) {
    modal.style.display = "none";
    cart = [];
    renderDesserts();
    renderCart();
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

