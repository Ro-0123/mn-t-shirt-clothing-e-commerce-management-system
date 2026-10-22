import {
  fetchStocksApi,
  restockProductApi,
  fetchSuppliersApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
  fetchDeliveriesApi,
  updateDeliveryStatusApi,
  fetchUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  fetchAnalyticsReportApi,
  fetchStoreInfoApi,
  updateStoreInfoApi,
  syncDummyJsonApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi
} from '@/api';
import { SuccessToast, ErrorToast } from '@/functions/sweetalert';

export default {
  namespaced: true,
  state: () => ({
    stockOverview: [],
    stockMovements: [],
    lowStockCount: 0,
    suppliers: [],
    deliveries: [],
    users: [],
    analytics: null,
    storeInfo: null,
    isLoading: false
  }),

  getters: {
    stockOverview: (state) => state.stockOverview,
    stockMovements: (state) => state.stockMovements,
    lowStockCount: (state, getters, rootState) => (rootState.products?.products || []).filter(p => Number(p.stock) <= Number(p.minStockLevel)).length,
    lowStockProducts: (state, getters, rootState) => (rootState.products?.products || []).filter(p => Number(p.stock) <= Number(p.minStockLevel)),
    suppliersList: (state) => state.suppliers,
    allSuppliers: (state) => state.suppliers,
    deliveriesList: (state) => state.deliveries,
    allDeliveries: (state) => state.deliveries,
    usersList: (state) => state.users,
    allUsers: (state) => state.users,
    analyticsData: (state) => state.analytics,
    storeInfoData: (state) => state.storeInfo,
    isLoading: (state) => state.isLoading
  },

  mutations: {
    SET_STOCKS(state, data) {
      state.stockOverview = Array.isArray(data?.overview) ? data.overview : (Array.isArray(data) ? data : []);
      state.stockMovements = Array.isArray(data?.movements) ? data.movements : [];
      state.lowStockCount = Number(data?.lowStockCount || 0);
    },
    SET_SUPPLIERS(state, items) {
      state.suppliers = items;
    },
    SET_DELIVERIES(state, items) {
      state.deliveries = items;
    },
    SET_USERS(state, items) {
      state.users = items;
    },
    SET_ANALYTICS(state, data) {
      state.analytics = data;
    },
    SET_STORE_INFO(state, data) {
      state.storeInfo = data;
    },
    SET_LOADING(state, val) {
      state.isLoading = val;
    },
    UPDATE_DELIVERY(state, updated) {
      const idx = state.deliveries.findIndex(d => d.id === updated.id);
      if (idx !== -1) {
        state.deliveries.splice(idx, 1, updated);
      }
    }
  },

  actions: {
    async fetchStocks({ commit }) {
      commit('SET_LOADING', true);
      try {
        const res = await fetchStocksApi();
        commit('SET_STOCKS', res.data.stocks || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async restockProduct({ dispatch }, payload) {
      try {
        await restockProductApi(payload);
        SuccessToast('Inventory updated successfully!');
        dispatch('fetchStocks');
        dispatch('products/fetchProducts', {}, { root: true });
      } catch (err) {
        ErrorToast('Failed to update stock');
        throw err;
      }
    },

    // operation: 'add' | 'remove' | 'set' (passing it through matters -- without
    // it, adding 5 would SET the stock to 5)
    async updateStock({ dispatch }, { productId, quantity, operation = 'set' }) {
      return dispatch('restockProduct', { productId, quantity, operation });
    },

    async createProduct({ dispatch }, data) {
      try {
        const res = await createProductApi(data);
        dispatch('products/fetchProducts', {}, { root: true });
        SuccessToast('Product Created', `${data.name} has been added.`);
        return res.data;
      } catch (err) {
        ErrorToast('Failed to Create Product', err.parsedMessage || 'Something went wrong while saving.');
        throw err;
      }
    },

    async updateProduct({ dispatch }, { id, productData }) {
      try {
        const res = await updateProductApi(id, productData);
        dispatch('products/fetchProducts', {}, { root: true });
        SuccessToast('Product Updated', `${productData.name} has been saved.`);
        return res.data;
      } catch (err) {
        ErrorToast('Failed to Update Product', err.parsedMessage || 'Something went wrong while saving.');
        throw err;
      }
    },

    async deleteProduct({ dispatch }, id) {
      await deleteProductApi(id);
      dispatch('products/fetchProducts', {}, { root: true });
    },

    async createCategory({ dispatch }, data) {
      const res = await createCategoryApi(data);
      dispatch('products/fetchCategories', null, { root: true });
      return res.data;
    },

    async updateCategory({ dispatch }, { id, categoryData }) {
      const res = await updateCategoryApi(id, categoryData);
      dispatch('products/fetchCategories', null, { root: true });
      return res.data;
    },

    async deleteCategory({ dispatch }, id) {
      await deleteCategoryApi(id);
      dispatch('products/fetchCategories', null, { root: true });
    },

    async fetchSuppliers({ commit }) {
      try {
        const res = await fetchSuppliersApi();
        const suppliers = (Array.isArray(res.data) ? res.data : (res.data.suppliers || [])).map(supplier => ({
          ...supplier,
          name: supplier.name || supplier.companyName || 'Unnamed Supplier',
          suppliedCategories: Array.isArray(supplier.suppliedCategories) ? supplier.suppliedCategories : []
        }));
        commit('SET_SUPPLIERS', suppliers);
      } catch (err) {
        console.error(err);
      }
    },

    async createSupplier({ dispatch }, data) {
      try {
        await createSupplierApi(data);
        SuccessToast('Supplier registered!');
        dispatch('fetchSuppliers');
      } catch (err) {
        ErrorToast('Failed to add supplier');
        throw err;
      }
    },

    async updateSupplier({ dispatch }, { id, data }) {
      try {
        await updateSupplierApi(id, data);
        SuccessToast('Supplier details saved');
        dispatch('fetchSuppliers');
      } catch (err) {
        ErrorToast('Failed to update supplier');
        throw err;
      }
    },

    async deleteSupplier({ dispatch }, id) {
      try {
        await deleteSupplierApi(id);
        SuccessToast('Supplier removed');
        dispatch('fetchSuppliers');
      } catch (err) {
        ErrorToast('Failed to delete supplier');
        throw err;
      }
    },

    async fetchDeliveries({ commit }) {
      try {
        const res = await fetchDeliveriesApi();
        commit('SET_DELIVERIES', Array.isArray(res.data) ? res.data : (res.data.deliveries || []));
      } catch (err) {
        console.error(err);
      }
    },

    async updateDeliveryStatus({ commit, dispatch }, { id, status, courierName, driverNotes }) {
      try {
        const res = await updateDeliveryStatusApi(id, { status, courierName, driverNotes });
        commit('UPDATE_DELIVERY', res.data);
        SuccessToast(status ? `Delivery ${id} status updated to ${status}` : `Delivery ${id} courier updated`);
        dispatch('orders/fetchOrders', null, { root: true });
      } catch (err) {
        ErrorToast('Failed to update delivery');
        throw err;
      }
    },

    async fetchUsers({ commit }) {
      try {
        const res = await fetchUsersApi();
        commit('SET_USERS', Array.isArray(res.data) ? res.data : (res.data.users || []));
      } catch (err) {
        console.error(err);
      }
    },

    async createUser({ dispatch }, data) {
      try {
        await createUserApi(data);
        SuccessToast('User account created');
        dispatch('fetchUsers');
      } catch (err) {
        ErrorToast('Failed to create user', err.parsedMessage || err.message);
        throw err;
      }
    },

    async updateUser({ dispatch }, { id, data }) {
      try {
        await updateUserApi(id, data);
        SuccessToast('User updated');
        dispatch('fetchUsers');
      } catch (err) {
        ErrorToast('Failed to update user');
        throw err;
      }
    },

    async updateUserRole({ dispatch }, { id, role }) {
      try {
        await updateUserApi(id, { role });
        dispatch('fetchUsers');
      } catch (err) {
        ErrorToast('Failed to update user role');
        throw err;
      }
    },

    async deleteUser({ dispatch }, id) {
      try {
        await deleteUserApi(id);
        SuccessToast('User removed');
        dispatch('fetchUsers');
      } catch (err) {
        ErrorToast(err.parsedMessage || 'Failed to delete user');
        throw err;
      }
    },

    async fetchAnalytics({ commit }) {
      try {
        const res = await fetchAnalyticsReportApi();
        commit('SET_ANALYTICS', res.data);
        return res.data;
      } catch (err) {
        console.error(err);
      }
    },

    async fetchStoreInfo({ commit }) {
      try {
        const res = await fetchStoreInfoApi();
        commit('SET_STORE_INFO', res.data);
      } catch (err) {
        console.error(err);
      }
    },

    async updateStoreInfo({ commit }, data) {
      try {
        const res = await updateStoreInfoApi(data);
        commit('SET_STORE_INFO', res.data);
        SuccessToast('Store settings saved successfully');
      } catch (err) {
        ErrorToast('Failed to save settings');
      }
    },

    async syncDummyJson({ dispatch }) {
      try {
        const res = await syncDummyJsonApi();
        SuccessToast(res.data.message);
        dispatch('products/fetchProducts', {}, { root: true });
        dispatch('products/fetchCategories', null, { root: true });
      } catch (err) {
        ErrorToast('DummyJSON sync error');
      }
    }
  }
};
