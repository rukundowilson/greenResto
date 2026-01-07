/**
 * Adds a dessert to the cart or updates quantity if already present
 * @param cart - Current cart array
 * @param dessert - Dessert to add
 * @param quantity - Quantity to add (must be positive)
 * @returns New cart array (immutable)
 */
export function addToCart(cart, dessert, quantity) {
    // Validate quantity
    if (quantity <= 0) {
        return cart;
    }
    // Check if dessert already exists in cart
    const existingItemIndex = cart.findIndex((item) => item.dessert.id === dessert.id);
    if (existingItemIndex >= 0) {
        // Update existing item quantity
        const newCart = [...cart];
        newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + quantity
        };
        return newCart;
    }
    else {
        // Add new item to cart
        const newItem = {
            dessert,
            quantity,
            addedAt: new Date()
        };
        return [...cart, newItem];
    }
}
