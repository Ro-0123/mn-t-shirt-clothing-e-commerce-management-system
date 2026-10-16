import { fetchWishlistApi, addToWishlistApi, removeFromWishlistApi } from '@/api';
import { SuccessToast, InfoToast, ErrorToast } from '@/functions/sweetalert';

export default {
  namespaced: true,
  state: () => ({
    items: []
  }),

  getters: {
    wishlistItems: (state) => state.items,
    wishlistCount: (state) => state.items.length,
    isInWishlist: (state) => (productId) => state.items.some(p => p.id === productId)
  },

  mutations: {
    SET_WISHLIST(state, items) {
      state.items = items;
    }
  },

  actions: {
    async fetchWishlist({ commit }) {
      try {
        const res = await fetchWishlistApi();
        commit('SET_WISHLIST', res.data.wishlistItems || []);
      } catch (err) {
        console.error(err);
      }
    },

    async toggleWishlist({ commit, state }, product) {
      try {
        const saved = state.items.some(item => (item.productId || item.Product?.id || item.id) === product.id);
        if (saved) {
          await removeFromWishlistApi(product.id);
          commit('SET_WISHLIST', state.items.filter(item => (item.productId || item.Product?.id || item.id) !== product.id));
        } else {
          await addToWishlistApi(product.id);
          commit('SET_WISHLIST', [...state.items, product]);
        }
        if (!saved) {
          SuccessToast(`Added ${product.name} to Wishlist!`);
        } else {
          InfoToast(`Removed from Wishlist`);
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          ErrorToast('Please sign in', 'Sign in to save items to your wishlist.');
        } else {
          console.error(err);
        }
      }
    },

    async removeFromWishlist({ commit, state }, productId) {
      try {
        await removeFromWishlistApi(productId);
        commit('SET_WISHLIST', state.items.filter(item => (item.productId || item.Product?.id || item.id) !== productId));
        InfoToast('Removed from Wishlist');
      } catch (err) {
        console.error(err);
      }
    }
  }
};
