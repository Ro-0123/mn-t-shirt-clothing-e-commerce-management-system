import apiClient from './client';

// Product APIs
export const fetchProductsApi = (params = {}) => apiClient.get('/products', { params });
export const fetchProductByIdApi = (id) => apiClient.get(`/products/${id}`);
export const createProductApi = (data) => apiClient.post('/products', data);
export const updateProductApi = (id, data) => apiClient.put(`/products/${id}`, data);
export const deleteProductApi = (id) => apiClient.delete(`/products/${id}`);
export const uploadProductImagesApi = (formData) => apiClient.post('/products/upload-images', formData, { headers: { 'Content-Type': undefined } });

// Category APIs
export const fetchCategoriesApi = () => apiClient.get('/categories');
export const createCategoryApi = (data) => apiClient.post('/categories', data);
export const updateCategoryApi = (id, data) => apiClient.put(`/categories/${id}`, data);
export const deleteCategoryApi = (id) => apiClient.delete(`/categories/${id}`);

// Cart APIs
export const fetchCartApi = () => apiClient.get('/cart');
export const addToCartApi = (item) => apiClient.post('/cart', item);
export const updateCartItemApi = (item) => apiClient.put('/cart', item);
export const removeCartItemApi = (item) => apiClient.delete('/cart', { data: item });
export const clearCartApi = () => apiClient.delete('/cart/clear');

// Wishlist APIs
export const fetchWishlistApi = () => apiClient.get('/wishlist');
export const addToWishlistApi = (productId) => apiClient.post('/wishlist', { productId });
export const removeFromWishlistApi = (productId) => apiClient.delete(`/wishlist/${productId}`);

// Orders & Checkout APIs
export const fetchOrdersApi = () => apiClient.get('/orders');
export const fetchOrderByIdApi = (id) => apiClient.get(`/orders/${id}`);
export const createOrderApi = (orderData) => apiClient.post('/orders', orderData);
export const updateOrderStatusApi = (id, statusData) => apiClient.put(`/orders/${id}/status`, statusData);
export const cancelOrderApi = (id, cancelReason) => apiClient.put(`/orders/${id}/cancel`, { cancelReason });
export const requestPaymentApi = (data) => apiClient.post('/payments/request', data);
export const generateKhqrApi = (data) => apiClient.post('/payments/khqr', data);
export const checkKhqrPaymentApi = (orderId) => apiClient.get(`/payments/khqr/check/${orderId}`);
export const checkKhqrPaymentByMd5Api = (md5) => apiClient.get(`/payments/khqr/check-md5/${md5}`);
export const generatePaywayPaymentApi = (data) => apiClient.post('/payments/payway/create', data);
export const checkPaywayPaymentApi = (tranId) => apiClient.get(`/payments/payway/check/${tranId}`);

// Stocks APIs
export const fetchStocksApi = () => apiClient.get('/stocks');
export const restockProductApi = async ({ productId, quantity, operation = 'set', minStockLevel, warehouseLocation, notes }) => {
	const stockResponse = await apiClient.get(`/stocks/product/${productId}`);
	const stock = stockResponse.data.stock;
	const nextQuantity = operation === 'add' ? stock.quantity + quantity : operation === 'remove' ? stock.quantity - quantity : quantity;
	return apiClient.put(`/stocks/${stock.id}`, { quantity: Math.max(0, nextQuantity), minStockLevel, warehouseLocation, notes });
};

// Suppliers APIs
export const fetchSuppliersApi = () => apiClient.get('/suppliers');
export const createSupplierApi = (data) => apiClient.post('/suppliers', data);
export const updateSupplierApi = (id, data) => apiClient.put(`/suppliers/${id}`, data);
export const deleteSupplierApi = (id) => apiClient.delete(`/suppliers/${id}`);

// Deliveries APIs
export const fetchDeliveriesApi = () => apiClient.get('/deliveries');
export const updateDeliveryStatusApi = (id, data) => apiClient.put(`/deliveries/${id}`, data);

// Users APIs (Admin)
export const fetchUsersApi = () => apiClient.get('/admin/users');
export const createUserApi = (data) => apiClient.post('/admin/users', data);
export const updateUserApi = (id, data) => apiClient.put(`/admin/users/${id}`, data);
export const deleteUserApi = (id) => apiClient.delete(`/admin/users/${id}`);

// Reports & Store Info
export const fetchAnalyticsReportApi = () => apiClient.get('/admin/analytics');
export const fetchStoreInfoApi = () => apiClient.get('/store-info');
export const updateStoreInfoApi = (data) => apiClient.put('/store-info', data);
export const syncDummyJsonApi = () => apiClient.post('/sync-dummyjson');

// Auth APIs
export const loginApi = (credentials) => apiClient.post('/auth/login', credentials);
export const registerApi = (userData) => apiClient.post('/auth/register', userData);
export const getCurrentUserApi = () => apiClient.get('/auth/profile');
export const updateProfileApi = (data) => apiClient.put('/auth/profile', data);
export const uploadAvatarApi = (formData) => apiClient.post('/auth/profile/avatar', formData, {
  headers: { 'Content-Type': undefined }
});
