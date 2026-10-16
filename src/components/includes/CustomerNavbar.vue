<template>
  <header class="sticky top-0 z-40 surface border-b border-[var(--border)]">
    <!-- Main Navigation Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20 gap-4">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2.5 flex-shrink-0 group">
          <div class="w-10 h-10 bg-[var(--text)] text-white flex items-center justify-center font-display text-lg group-hover:bg-[var(--accent)] transition-colors">
            MN
          </div>
          <div>
            <span class="font-display text-lg sm:text-xl text-[var(--text)] block leading-none">MN T-Shirt</span>
            <span class="text-[10px] tracking-widest uppercase font-bold text-[var(--text-muted)] block mt-0.5">Clothing Co. &middot; Phnom Penh</span>
          </div>
        </router-link>

        <!-- Nav Links (Desktop) -->
        <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
          <router-link to="/" class="hover:text-[var(--text)] transition-colors py-1 border-b-2 border-transparent" active-class="!text-[var(--text)] !border-[var(--accent)]">
            Home
          </router-link>
          <router-link to="/shop" class="hover:text-[var(--text)] transition-colors py-1 border-b-2 border-transparent" active-class="!text-[var(--text)] !border-[var(--accent)]">
            All Products
          </router-link>
          <router-link :to="{ path: '/shop', query: { category: 'oversized-streetwear' } }" class="hover:text-[var(--text)] transition-colors py-1">
            Oversized Tees
          </router-link>
          <router-link :to="{ path: '/shop', query: { category: 'graphic-anime-tees' } }" class="hover:text-[var(--text)] transition-colors py-1">
            Graphic & Art
          </router-link>
          <router-link :to="{ path: '/shop', query: { category: 'hoodies-longsleeves' } }" class="hover:text-[var(--text)] transition-colors py-1">
            Hoodies & Fleece
          </router-link>
          <router-link to="/orders" class="hover:text-[var(--text)] transition-colors py-1" active-class="!text-[var(--text)] !border-[var(--accent)]">
            My Orders
          </router-link>
        </nav>

        <!-- Search Bar -->
        <div class="hidden md:flex items-center flex-1 max-w-xs relative">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="Search t-shirts, fit, fabric..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <i class="fa-solid fa-magnifying-glass absolute left-3 text-[var(--text-faint)] text-xs"></i>
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 text-[var(--text-faint)] hover:text-[var(--text)] text-xs cursor-pointer"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Action Icons (Wishlist, Cart, User, Mobile Menu) -->
        <div class="flex items-center gap-1 sm:gap-2">
          <!-- Wishlist -->
          <router-link
            to="/wishlist"
            class="relative p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-sm hover:bg-[var(--bg-alt)]"
            title="Saved Wishlist"
          >
            <i class="fa-regular fa-heart text-lg"></i>
            <span
              v-if="wishlistCount > 0"
              class="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--accent)] text-white rounded-full text-[9px] font-bold flex items-center justify-center"
            >
              {{ wishlistCount }}
            </span>
          </router-link>

          <!-- Cart Drawer Button -->
          <button
            @click="openCart"
            class="relative p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-sm hover:bg-[var(--bg-alt)] cursor-pointer"
            title="Shopping Cart"
          >
            <i class="fa-solid fa-bag-shopping text-lg"></i>
            <span
              v-if="cartCount > 0"
              class="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--text)] text-white rounded-full text-[9px] font-bold flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </button>

          <!-- Sign In link (anonymous visitors) -->
          <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="ml-1 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold uppercase tracking-wide transition-colors rounded-sm"
          >
            Sign In
          </router-link>

          <!-- User Dropdown / Auth link -->
          <div v-else class="relative ml-1" ref="userMenuRef">
            <button
              @click="isUserMenuOpen = !isUserMenuOpen"
              class="flex items-center gap-2 p-1.5 rounded-sm hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
            >
              <img
                :src="user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'"
                alt="User Avatar"
                class="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--border)]"
              />
              <span class="hidden sm:inline text-xs font-semibold text-[var(--text)]">{{ user?.name?.split(' ')[0] || 'Account' }}</span>
              <i class="fa-solid fa-chevron-down text-[10px] text-[var(--text-faint)] hidden sm:inline"></i>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-56 surface rounded-sm shadow-lg border border-[var(--border)] py-2 z-50"
            >
              <div class="px-4 py-2.5 border-b border-[var(--border)]">
                <p class="text-xs font-bold text-[var(--text)]">{{ user?.name }}</p>
                <p class="text-[11px] text-[var(--text-muted)] truncate">{{ user?.email }}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase"
                      :class="userRole === 'Admin' ? 'bg-[var(--accent)] text-white' : userRole === 'Staff' ? 'bg-[var(--text)] text-white' : 'border border-[var(--border-strong)] text-[var(--text-muted)]'">
                  {{ userRole }} Account
                </span>
              </div>

              <div class="py-1">
                <router-link
                  to="/profile"
                  @click="isUserMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)] transition-colors"
                >
                  <i class="fa-solid fa-user-gear text-[var(--text-faint)] w-4"></i> My Profile & Addresses
                </router-link>
                <router-link
                  to="/orders"
                  @click="isUserMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)] transition-colors"
                >
                  <i class="fa-solid fa-receipt text-[var(--text-faint)] w-4"></i> Order History
                </router-link>
                <router-link
                  to="/wishlist"
                  @click="isUserMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text)] transition-colors"
                >
                  <i class="fa-solid fa-heart text-[var(--text-faint)] w-4"></i> Saved Wishlist
                </router-link>

                <div v-if="['Staff', 'Admin'].includes(userRole)" class="border-t border-[var(--border)] mt-1 pt-1">
                  <router-link
                    to="/admin/dashboard"
                    @click="isUserMenuOpen = false"
                    class="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--bg-alt)] transition-colors"
                  >
                    <i class="fa-solid fa-gauge-high text-[var(--accent)] w-4"></i> AdminLTE Backoffice
                  </router-link>
                </div>
              </div>

              <div class="border-t border-[var(--border)] pt-1">
                <button
                  @click="handleLogout"
                  class="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--accent)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                >
                  <i class="fa-solid fa-arrow-right-from-bracket w-4"></i> Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Hamburger -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="p-2 lg:hidden text-[var(--text-muted)] hover:text-[var(--text)] rounded-sm hover:bg-[var(--bg-alt)]"
          >
            <i :class="isMobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'" class="text-xl"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Search (Small screen) -->
      <div class="md:hidden pb-3">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="Search MN T-Shirts..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)]"
          />
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[var(--text-faint)] text-xs"></i>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div v-if="isMobileMenuOpen" class="lg:hidden border-t border-[var(--border)] surface px-4 py-3 space-y-2">
      <router-link to="/" @click="isMobileMenuOpen = false" class="block py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]">
        Home
      </router-link>
      <router-link to="/shop" @click="isMobileMenuOpen = false" class="block py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]">
        All Products
      </router-link>
      <router-link to="/orders" @click="isMobileMenuOpen = false" class="block py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]">
        My Orders
      </router-link>
      <router-link v-if="['Staff', 'Admin'].includes(userRole)" to="/admin/dashboard" @click="isMobileMenuOpen = false" class="block py-2 text-sm font-bold text-[var(--accent)]">
        AdminLTE Backoffice
      </router-link>
    </div>
  </header>
</template>


<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'CustomerNavbar',
  setup() {
    const store = useStore();
    const router = useRouter();

    const searchQuery = ref('');
    const isUserMenuOpen = ref(false);
    const isMobileMenuOpen = ref(false);

    const user = computed(() => store.getters['auth/currentUser']);
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const userRole = computed(() => store.getters['auth/userRole']);
    const cartCount = computed(() => store.getters['cart/totalItemsCount']);
    const wishlistCount = computed(() => store.getters['wishlist/wishlistCount']);

    const openCart = () => {
      store.dispatch('cart/toggleCartDrawer', true);
    };

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ path: '/shop', query: { search: searchQuery.value.trim() } });
      }
    };

    const clearSearch = () => {
      searchQuery.value = '';
      router.push({ path: '/shop' });
    };

    const handleLogout = () => {
      isUserMenuOpen.value = false;
      store.dispatch('auth/logout');
      router.push('/login');
    };

    return {
      searchQuery,
      isUserMenuOpen,
      isMobileMenuOpen,
      user,
      isAuthenticated,
      userRole,
      cartCount,
      wishlistCount,
      openCart,
      handleSearch,
      clearSearch,
      handleLogout
    };
  }
};
</script>
