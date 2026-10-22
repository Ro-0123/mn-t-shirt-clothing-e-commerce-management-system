import { loginApi, registerApi, getCurrentUserApi, updateProfileApi, uploadAvatarApi } from '@/api';
import { SuccessToast, ErrorToast } from '@/functions/sweetalert';
import { getStoredToken, getStoredUser, saveSession, saveUser, clearSession, isStaffRole } from '@/functions/authStorage';

const roleOf = (user) => String(user?.role || 'customer').toLowerCase();

// initAuth asks the server who the saved token really belongs to. The router
// waits on this before opening any /admin page, so it is shared, not repeated.
let authCheck = null;

export default {
  namespaced: true,
  state: () => ({
    user: getStoredUser(),
    token: getStoredToken(),
    isLoading: false,
    authError: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    currentUser: (state) => state.user,
    userRole: (state) => {
      const role = roleOf(state.user);
      return role.charAt(0).toUpperCase() + role.slice(1);
    },
    isAdmin: (state) => roleOf(state.user) === 'admin',
    isStaffOrAdmin: (state) => isStaffRole(roleOf(state.user)),
    isLoading: (state) => state.isLoading
  },

  mutations: {
    // Signing in / out: saves the session in the right storage for the role
    SET_SESSION(state, { user, token }) {
      state.user = user;
      state.token = token;
      if (user && token) {
        saveSession(user, token);
      } else {
        clearSession();
      }
    },
    // Profile edits: same session, updated user details
    SET_USER(state, user) {
      state.user = user;
      saveUser(user);
    },
    SET_LOADING(state, val) {
      state.isLoading = val;
    },
    SET_AUTH_ERROR(state, err) {
      state.authError = err;
    }
  },

  actions: {
    initAuth({ commit }) {
      if (authCheck) return authCheck;

      authCheck = (async () => {
        const token = getStoredToken();
        if (!token) {
          commit('SET_SESSION', { user: null, token: null });
          return null;
        }

        // Staff/admin logins saved by an older version (in localStorage, shared
        // by every tab) are dropped -- they must sign in again in this tab.
        let inSession = false;
        try { inSession = !!sessionStorage.getItem('mn_auth_token'); } catch { /* blocked */ }

        try {
          const response = await getCurrentUserApi();
          const user = response.data.user;
          user.role = roleOf(user);
          if (isStaffRole(user.role) && !inSession) {
            commit('SET_SESSION', { user: null, token: null });
            return null;
          }
          // Role always comes from the server, never from what the browser saved
          commit('SET_SESSION', { user, token });
          return user;
        } catch (error) {
          commit('SET_SESSION', { user: null, token: null });
          return null;
        }
      })();

      return authCheck;
    },

    async login({ commit, dispatch }, credentials) {
      commit('SET_LOADING', true);
      commit('SET_AUTH_ERROR', null);
      try {
        const response = await loginApi(credentials);
        const { user, token } = response.data;
        user.role = user.role?.toLowerCase() || 'customer';
        commit('SET_SESSION', { user, token });
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
        commit('SET_SESSION', { user, token });
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
        user.role = roleOf(user);
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
        user.role = roleOf(user);
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
      commit('SET_SESSION', { user: null, token: null });
      commit('cart/SET_CART', [], { root: true });
      commit('wishlist/SET_WISHLIST', [], { root: true });
      SuccessToast('Logged out successfully');
    }
  }
};
