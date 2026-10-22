import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

// Customer Pages
const Home = () => import('@/views/customer/Home.vue');
const Shop = () => import('@/views/customer/Shop.vue');
const ProductDetail = () => import('@/views/customer/ProductDetail.vue');
const Cart = () => import('@/views/customer/Cart.vue');
const Checkout = () => import('@/views/customer/Checkout.vue');
const OrderSuccess = () => import('@/views/customer/OrderSuccess.vue');
const Orders = () => import('@/views/customer/Orders.vue');
const Wishlist = () => import('@/views/customer/Wishlist.vue');
const Profile = () => import('@/views/customer/Profile.vue');
const Login = () => import('@/views/auth/Login.vue');
const Register = () => import('@/views/auth/Register.vue');

// Admin & Staff Backoffice Pages
const AdminLayout = () => import('@/views/admin/AdminLayout.vue');
const Dashboard = () => import('@/views/admin/Dashboard.vue');
const ManageProducts = () => import('@/views/admin/Products.vue');
const ManageStocks = () => import('@/views/admin/Stocks.vue');
const ManageCategories = () => import('@/views/admin/Categories.vue');
const ManageSuppliers = () => import('@/views/admin/Suppliers.vue');
const ManageOrders = () => import('@/views/admin/Orders.vue');
const ManageDeliveries = () => import('@/views/admin/Deliveries.vue');
const ManageUsers = () => import('@/views/admin/Users.vue');
const Reports = () => import('@/views/admin/Reports.vue');
const StoreSettings = () => import('@/views/admin/StoreInfo.vue');

const routes = [
  // Storefront
  { path: '/', name: 'Home', component: Home },
  { path: '/shop', name: 'Shop', component: Shop },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/checkout', name: 'Checkout', component: Checkout, meta: { requiresAuth: true } },
  { path: '/order-success/:id', name: 'OrderSuccess', component: OrderSuccess },
  { path: '/orders', name: 'Orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/wishlist', name: 'Wishlist', component: Wishlist, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  // Admin & Staff Backoffice
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, requiresStaff: true },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: Dashboard },
      { path: 'products', name: 'AdminProducts', component: ManageProducts },
      { path: 'stocks', name: 'AdminStocks', component: ManageStocks },
      { path: 'categories', name: 'AdminCategories', component: ManageCategories },
      { path: 'suppliers', name: 'AdminSuppliers', component: ManageSuppliers },
      { path: 'orders', name: 'AdminOrders', component: ManageOrders },
      { path: 'deliveries', name: 'AdminDeliveries', component: ManageDeliveries },
      { path: 'users', name: 'AdminUsers', component: ManageUsers, meta: { requiresAdmin: true } },
      { path: 'reports', name: 'AdminReports', component: Reports, meta: { requiresAdmin: true } },
      { path: 'store-info', name: 'AdminStoreInfo', component: StoreSettings }
    ]
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.path === from.path) {
      // Same page, only query params changed (e.g. category/size/sort filters) - stay put.
      return false;
    }
    return { top: 0, behavior: 'smooth' };
  }
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Protected pages wait for the server to confirm who the saved login
  // belongs to, so a role edited in the browser can't open /admin.
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    await store.dispatch('auth/initAuth');
  }

  const currentRole = store.getters['auth/userRole'].toLowerCase();

  // Admin pages: not signed in -> plain /login (no ?redirect=/admin/...).
  // Signed in as a customer -> back to the shop; they're already logged in,
  // so showing them the login form again only confuses them.
  if (to.meta.requiresStaff && !['staff', 'admin'].includes(currentRole)) {
    return next(store.getters['auth/isAuthenticated'] ? { name: 'Home' } : { name: 'Login' });
  }

  // Customer pages (checkout, orders...) still come back to where they were
  if (to.meta.requiresAuth && !store.getters['auth/isAuthenticated']) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresAdmin && currentRole !== 'admin') {
    // If staff tries to access users/reports, redirect to dashboard
    return next({ name: 'AdminDashboard' });
  }

  next();
});

export default router;
