import { loginApi, registerApi, getCurrentUserApi, updateProfileApi, uploadAvatarApi } from '@/api';
import { SuccessToast, ErrorToast } from '@/functions/sweetalert';

export default {
  namespaced: true,
  state: () => ({
    user: JSON.parse(localStorage.getItem('mn_user') || 'null'),
    token: localStorage.getItem('mn_auth_token') || null,
    currentRole: localStorage.getItem('mn_current_role') || 'customer',
    isLoading: false,
    authError: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    currentUser: (state) => state.user,
    userRole: (state) => {
      const role = (state.currentRole || state.user?.role || 'customer').toLowerCase();
      return role.charAt(0).toUpperCase() + role.slice(1);
    },
    isAdmin: (state) => (state.currentRole || state.user?.role || '').toLowerCase() === 'admin',
    isStaffOrAdmin: (state) => ['staff', 'admin'].includes((state.currentRole || state.user?.role || '').toLowerCase()),
    isLoading: (state) => state.isLoading
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user;
      if (user) {
        localStorage.setItem('mn_user', JSON.stringify(user));
        state.currentRole = user.role;
        localStorage.setItem('mn_current_role', user.role);
      } else {
        localStorage.removeItem('mn_user');
      }
    },
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('mn_auth_token', token);
      } else {
        localStorage.removeItem('mn_auth_token');
      }
    },
    SET_ROLE(state, role) {
      state.currentRole = role;
      localStorage.setItem('mn_current_role', role);
      if (state.user) {
        state.user.role = role;
      }
    },
    SET_LOADING(state, val) {
      state.isLoading = val;
    },
    SET_AUTH_ERROR(state, err) {
      state.authError = err;
    }
  },

  actions: {
    async initAuth({ commit }) {
      const token = localStorage.getItem('mn_auth_token');
      const savedUser = localStorage.getItem('mn_user');

      if (!token || !savedUser) {
        return null;
      }

      try {
        const response = await getCurrentUserApi();
        const user = response.data.user;
        commit('SET_USER', user);
        commit('SET_TOKEN', token);
        return user;
      } catch (error) {
        commit('SET_USER', null);
        commit('SET_TOKEN', null);
        commit('SET_ROLE', 'customer');
        return null;
      }
    },

    async login({ commit, dispatch }, credentials) {
      commit('SET_LOADING', true);
      commit('SET_AUTH_ERROR', null);
      try {
        const response = await loginApi(credentials);
        const { user, token } = response.data;
        user.role = user.role?.toLowerCase() || 'customer';
        commit('SET_USER', user);
        commit('SET_TOKEN', token);
        dispatch('cart/fetchCart', null, { root: true });
        dispatch('wishlist/fetchWishlist', null, { root: true });
        SuccessToast(`Welcome back, ${user.name}!`);
        return user;
      } catch (error) {
        const msg = error.parsedMessage || 'Login failed. Please check credentials.';
        commit('SET_AUTH_ERROR', msg);
        ErrorToast('Login Failed', msg);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async register({ commit, dispatch }, userData) {
      commit('SET_LOADING', true);
      commit('SET_AUTH_ERROR', null);
      try {
        const response = await registerApi(userData);
        const { user, token } = response.data;
        commit('SET_USER', user);
        commit('SET_TOKEN', token);
        dispatch('cart/fetchCart', null, { root: true });
        dispatch('wishlist/fetchWishlist', null, { root: true });
        SuccessToast('Account created successfully!');
        return user;
      } catch (error) {
        const msg = error.parsedMessage || error.message || 'Registration failed.';
        commit('SET_AUTH_ERROR', msg);
        ErrorToast('Registration Failed', msg);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateProfile({ commit, state }, profileData) {
      commit('SET_LOADING', true);
      try {
        const response = await updateProfileApi(profileData);
        const user = response.data.user;
        user.role = state.currentRole || user.role?.toLowerCase() || 'customer';
        commit('SET_USER', user);
        SuccessToast('Profile Updated', 'Your profile details have been saved.');
        return user;
      } catch (error) {
        const msg = error.parsedMessage || 'Failed to update profile.';
        ErrorToast('Update Failed', msg);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async uploadAvatar({ commit, state }, file) {
      commit('SET_LOADING', true);
      try {
        const formData = new FormData();
        formData.append('avatar', file, file.name || 'avatar.jpg');
        const response = await uploadAvatarApi(formData);
        const user = response.data.user;
        user.role = state.currentRole || user.role?.toLowerCase() || 'customer';
        commit('SET_USER', user);
        SuccessToast('Profile Photo Updated', 'Your new photo has been saved.');
        return user;
      } catch (error) {
        const msg = error.parsedMessage || 'Failed to upload photo.';
        ErrorToast('Upload Failed', msg);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    logout({ commit }) {
      commit('SET_USER', null);
      commit('SET_TOKEN', null);
      commit('SET_ROLE', 'Customer');
      commit('cart/SET_CART', [], { root: true });
      commit('wishlist/SET_WISHLIST', [], { root: true });
      SuccessToast('Logged out successfully');
    }
  }
};
