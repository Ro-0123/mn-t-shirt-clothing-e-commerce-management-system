import {
  fetchOrdersApi,
  fetchOrderByIdApi,
  createOrderApi,
  updateOrderStatusApi,
  cancelOrderApi
} from '@/api';
import { SuccessToast, ErrorToast } from '@/functions/sweetalert';
import confetti from 'canvas-confetti';

export default {
  namespaced: true,
  state: () => ({
    orders: [],
    currentOrder: null,
    isLoading: false
  }),

  getters: {
    allOrders: (state) => state.orders,
    currentOrder: (state) => state.currentOrder,
    pendingOrdersCount: (state) => state.orders.filter(o => o.orderStatus === 'Pending').length,
    processingOrdersCount: (state) => state.orders.filter(o => o.orderStatus === 'Processing').length,
    shippedOrdersCount: (state) => state.orders.filter(o => o.orderStatus === 'Shipped').length,
    deliveredOrdersCount: (state) => state.orders.filter(o => o.orderStatus === 'Delivered').length,
    isLoading: (state) => state.isLoading
  },

  mutations: {
    SET_ORDERS(state, items) {
      state.orders = items;
    },
    SET_CURRENT_ORDER(state, item) {
      state.currentOrder = item;
    },
    SET_LOADING(state, val) {
      state.isLoading = val;
    },
    ADD_ORDER(state, order) {
      state.orders.unshift(order);
    },
    UPDATE_ORDER(state, updated) {
      const idx = state.orders.findIndex(o => o.id === updated.id);
      if (idx !== -1) {
        state.orders.splice(idx, 1, updated);
      }
    }
  },

  actions: {
    async fetchOrders({ commit }) {
      commit('SET_LOADING', true);
      try {
        const res = await fetchOrdersApi();
          const orders = Array.isArray(res.data) ? res.data : (res.data.orders || []);
          commit('SET_ORDERS', orders);
        return res.data;
      } catch (err) {
        console.error(err);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchOrderById({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        const res = await fetchOrderByIdApi(id);
        commit('SET_CURRENT_ORDER', res.data);
        return res.data;
      } catch (err) {
        ErrorToast('Order not found');
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async placeOrder({ commit, dispatch, rootState }, orderPayload) {
      commit('SET_LOADING', true);
      try {
        // paymentMethod is sent as-is (ABA_QR, PAYWAY_QR, PAYWAY_CARD, STORE_CREDIT,
        // PAYPAL) -- the backend's PAYMENT_METHOD_TO_BACKEND map is the single source
        // of truth for translating these into its own enum values.
        const res = await createOrderApi(orderPayload);
        const order = res.data.order || res.data;
        commit('ADD_ORDER', order);
        commit('SET_CURRENT_ORDER', order);

        if (res.data.storeCredit !== undefined && rootState.auth.user) {
          commit('auth/SET_USER', { ...rootState.auth.user, storeCredit: res.data.storeCredit }, { root: true });
        }
        
        // Trigger celebratory confetti effect on successful order placement!
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas not supported
        }

        // Refresh cart in Vuex
        dispatch('cart/fetchCart', null, { root: true });
        // Refresh products stock in Vuex
        dispatch('products/fetchProducts', {}, { root: true });

        SuccessToast('Order placed successfully!', `Order Ref: ${order.orderNumber || order.id}`);
        return order;
      } catch (err) {
        ErrorToast('Order Failed', err.parsedMessage || 'Could not place order');
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateOrderStatus({ commit }, { orderId, orderStatus, paymentStatus, carrier, trackingNumber }) {
      try {
        const res = await updateOrderStatusApi(orderId, { orderStatus, paymentStatus, carrier, trackingNumber });
        commit('UPDATE_ORDER', res.data);
        SuccessToast(`Order ${orderId} updated to ${orderStatus}`);
        return res.data;
      } catch (err) {
        ErrorToast('Failed to update order status');
        throw err;
      }
    },

    async cancelOrder({ commit, dispatch, rootState }, { orderId, cancelReason }) {
      try {
        const res = await cancelOrderApi(orderId, cancelReason);
        await dispatch('fetchOrders');

        if (rootState.auth.user) {
          commit('auth/SET_USER', { ...rootState.auth.user, storeCredit: res.data.storeCredit }, { root: true });
        }

        SuccessToast(
          'Order Cancelled',
          `Order ${orderId} has been cancelled. Your store credit balance is $${Number(res.data.storeCredit || 0).toFixed(2)}.`
        );
      } catch (err) {
        ErrorToast('Failed to Cancel Order', err.parsedMessage || 'Only pending orders can be cancelled.');
        throw err;
      }
    }
  }
};
