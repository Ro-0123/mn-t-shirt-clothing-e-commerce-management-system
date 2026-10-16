import {
  fetchProductsApi,
  fetchProductByIdApi,
  fetchCategoriesApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi
} from '@/api';
import { SuccessToast, ErrorToast } from '@/functions/sweetalert';

const normalizeProduct = (product) => {
  let images = product.images;
  if (typeof images === 'string') {
    try {
      const parsedImages = JSON.parse(images);
      images = Array.isArray(parsedImages) ? parsedImages : [images];
    } catch {
      images = [images];
    }
  }

  return {
    ...product,
    price: Number(product.price || 0),
    originalPrice: Number(product.originalPrice ?? product.discountPrice ?? product.price ?? 0),
    stock: Number(product.stock ?? product.Stock?.quantity ?? 0),
    minStockLevel: Number(product.minStockLevel ?? product.Stock?.minStockLevel ?? 10),
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    images: images?.length ? images : (product.image ? [product.image] : [])
  };
};

export default {
  namespaced: true,
  state: () => ({
    products: [],
    categories: [],
    currentProduct: null,
    isLoading: false,
    filters: {
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      size: '',
      sort: 'newest'
    }
  }),

  getters: {
    allProducts: (state) => state.products,
    allCategories: (state) => state.categories,
    featuredProducts: (state) => state.products.filter(p => p.isFeatured),
    bestSellers: (state) => state.products.filter(p => p.isBestSeller),
    newArrivals: (state) => state.products.filter(p => p.isNewArrival),
    activeFilters: (state) => state.filters,
    isLoading: (state) => state.isLoading
  },

  mutations: {
    SET_PRODUCTS(state, items) {
      state.products = Array.isArray(items) ? items : [];
    },
    SET_CATEGORIES(state, items) {
      state.categories = Array.isArray(items) ? items : [];
    },
    SET_CURRENT_PRODUCT(state, item) {
      state.currentProduct = item;
    },
    SET_LOADING(state, val) {
      state.isLoading = val;
    },
    SET_FILTERS(state, payload) {
      state.filters = { ...state.filters, ...payload };
    },
    RESET_FILTERS(state) {
      state.filters = {
        search: '',
        category: '',
        minPrice: null,
        maxPrice: null,
        size: '',
        sort: 'newest'
      };
    },
    ADD_PRODUCT(state, product) {
      state.products.unshift(product);
    },
    UPDATE_PRODUCT(state, updated) {
      const idx = state.products.findIndex(p => p.id === updated.id);
      if (idx !== -1) {
        state.products.splice(idx, 1, updated);
      }
    },
    REMOVE_PRODUCT(state, id) {
      state.products = state.products.filter(p => p.id !== id);
    }
  },

  actions: {
    async fetchProducts({ commit, state }, customParams = {}) {
      commit('SET_LOADING', true);
      try {
        const params = { ...state.filters, ...customParams };
        // Clean empty parameters
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });
        const res = await fetchProductsApi(params);
        const rawProducts = Array.isArray(res.data) ? res.data : res.data.products;
        const products = (rawProducts || []).map(normalizeProduct);
        commit('SET_PRODUCTS', products);
        return products;
      } catch (err) {
        ErrorToast('Failed to load products');
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchProductById({ commit }, id) {
      commit('SET_LOADING', true);
      try {
        const res = await fetchProductByIdApi(id);
        const product = normalizeProduct(res.data.product || res.data);
        commit('SET_CURRENT_PRODUCT', product);
        return product;
      } catch (err) {
        ErrorToast('Product not found');
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchCategories({ commit }) {
      try {
        const res = await fetchCategoriesApi();
        const categories = Array.isArray(res.data) ? res.data : res.data.categories;
        commit('SET_CATEGORIES', categories);
        return categories;
      } catch (err) {
        console.error(err);
      }
    },

    async createProduct({ commit, dispatch }, data) {
      try {
        const res = await createProductApi(data);
        commit('ADD_PRODUCT', res.data);
        SuccessToast('Product added successfully!');
        dispatch('fetchCategories');
        return res.data;
      } catch (err) {
        ErrorToast('Failed to create product');
        throw err;
      }
    },

    async updateProduct({ commit, dispatch }, { id, data }) {
      try {
        const res = await updateProductApi(id, data);
        commit('UPDATE_PRODUCT', res.data);
        SuccessToast('Product updated successfully!');
        dispatch('fetchCategories');
        return res.data;
      } catch (err) {
        ErrorToast('Failed to update product');
        throw err;
      }
    },

    async deleteProduct({ commit, dispatch }, id) {
      try {
        await deleteProductApi(id);
        commit('REMOVE_PRODUCT', id);
        SuccessToast('Product removed');
        dispatch('fetchCategories');
      } catch (err) {
        ErrorToast('Failed to delete product');
        throw err;
      }
    }
  }
};
