import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cartItems: [],
  cartOpen: false,

  addToCart: (product) => set((state) => {
    const existing = state.cartItems.find((item) => item.id === product.id);

    return {
      cartItems: existing
        ? state.cartItems.map((item) => item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item)
        : [...state.cartItems, { ...product, quantity: 1 }],
      cartOpen: true,
    };
  }),

  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.flatMap((item) => {
      if (item.id !== productId) return [item];
      return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
    }),
  })),

  openCart: () => set({ cartOpen: true }),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  resetCart: () => set({ cartItems: [], cartOpen: false }),
}));

export const selectCartCount = (state) =>
  state.cartItems.reduce((count, item) => count + item.quantity, 0);

export const selectCartTotal = (state) =>
  state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
