import {
  fetchCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi
} from '@/api';
import { SuccessToast, InfoToast } from '@/functions/sweetalert';

const normalizeCartItems = (items, products = [], addedProduct = null) => {
  const productMap = new Map(products.map(product => [Number(product.id), product]));
  if (addedProduct) productMap.set(Number(addedProduct.id), addedProduct);

  return (Array.isArray(items) ? items : []).map(item => {
    const product = productMap.get(Number(item.productId));
    return product
      ? {
          ...item,
          name: product.name,
          price: Number(product.price || 0),
          image: product.images?.[0] || product.image || item.image
        }
      : item;
  });
};

// Send a guest to the login page, remembering where they were so Login can bring them back.
// The router is imported lazily because router/index.js already imports the store.
const redirectToLogin = async () => {
  const { default: router } = await import('@/router');
  InfoToast('Please sign in', 'Sign in to add items to your bag.');
  router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
};

export default {
  namespaced: true,
  state: () => ({
    items: [],
    isDrawerOpen: false,
    promoCode: '',
    discountRate: 0 // 0.2 for 20%
  }),

  getters: {
    cartItems: (state) => state.items,
    totalItemsCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    discountAmount: (state, getters) => Math.round(getters.subtotal * state.discountRate * 100) / 100,
    shippingFee: (state, getters) => 0,
    totalAmount: (state, getters) => {
      const discounted = getters.subtotal - getters.discountAmount;
      return Math.max(0, Math.round((discounted + getters.shippingFee) * 100) / 100);
    },
    isDrawerOpen: (state) => state.isDrawerOpen,
    appliedPromo: (state) => state.promoCode
  },

  mutations: {
    SET_CART(state, items) {
      state.items = items;
    },
    SET_DRAWER(state, isOpen) {
      state.isDrawerOpen = isOpen;
    },
    SET_PROMO(state, { code, rate }) {
      state.promoCode = code;
      state.discountRate = rate;
    },
    CLEAR_PROMO(state) {
      state.promoCode = '';
      state.discountRate = 0;
    }
  },

  actions: {
    async fetchCart({ commit, rootState }) {
      try {
        const res = await fetchCartApi();
        commit('SET_CART', normalizeCartItems(res.data, rootState.products.products));
      } catch (err) {
        console.error(err);
      }
    },

    // Resolves to true when the item was added, false otherwise (e.g. guest sent to login).
    async addToCart({ commit, rootState, rootGetters }, { product, size, color, quantity = 1, openDrawer = true }) {
      if (!rootGetters['auth/isAuthenticated']) {
        await redirectToLogin();
        return false;
      }
      try {
        const res = await addToCartApi({
          productId: product.id,
          size: size || (product.sizes?.[0] || 'M'),
          color: color || (product.colors?.[0] || 'Black'),
          quantity,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || ''
        });
        commit('SET_CART', normalizeCartItems(res.data, rootState.products.products, product));
        SuccessToast(`Added ${product.name} (${size || 'M'}) to Bag!`);
        if (openDrawer) {
          commit('SET_DRAWER', true);
        }
        return true;
      } catch (err) {
        // 401 here means the saved session expired
        if (err?.response?.status === 401) {
          await redirectToLogin();
        } else {
          console.error(err);
        }
        return false;
      }
    },

    async updateQuantity({ commit }, { productId, size, color, quantity }) {
      try {
        const res = await updateCartItemApi({ productId, size, color, quantity });
        commit('SET_CART', res.data);
      } catch (err) {
        console.error(err);
      }
    },

    async removeItem({ commit }, { productId, size, color }) {
      try {
        const res = await removeCartItemApi({ productId, size, color });
        commit('SET_CART', res.data);
        InfoToast('Item removed from cart');
      } catch (err) {
        console.error(err);
      }
    },

    async clearCart({ commit }) {
      try {
        await clearCartApi();
        commit('SET_CART', []);
        commit('CLEAR_PROMO');
      } catch (err) {
        console.error(err);
      }
    },

    applyPromoCode({ commit }, code) {
      const trimmed = (code || '').trim().toUpperCase();
      if (trimmed === 'MN20' || trimmed === 'DISCOUNT20' || trimmed === 'WELCOME20') {
        commit('SET_PROMO', { code: trimmed, rate: 0.20 });
        SuccessToast('20% Promo Discount Applied!');
        return { success: true, message: 'Promo applied!' };
      } else if (trimmed === 'FREESHIP') {
        commit('SET_PROMO', { code: trimmed, rate: 0.10 });
        SuccessToast('Free Ship & 10% Discount Applied!');
        return { success: true, message: 'Promo applied!' };
      } else {
        return { success: false, message: 'Invalid promo code. Try "MN20" for 20% off!' };
      }
    },

    toggleCartDrawer({ commit, state }, force) {
      commit('SET_DRAWER', force !== undefined ? force : !state.isDrawerOpen);
    }
  }
};
