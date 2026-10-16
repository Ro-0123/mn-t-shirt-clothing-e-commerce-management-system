import { createStore } from 'vuex';
import auth from './modules/auth';
import products from './modules/products';
import cart from './modules/cart';
import wishlist from './modules/wishlist';
import orders from './modules/orders';
import admin from './modules/admin';

const store = createStore({
  modules: {
    auth,
    products,
    cart,
    wishlist,
    orders,
    admin
  }
});

export default store;
