<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <div class="divider flex items-center justify-between pb-5">
      <div>
        <h1 class="font-display text-3xl sm:text-4xl text-[var(--text)]">Saved Wishlist</h1>
        <p class="text-xs text-[var(--text-muted)] mt-1">Keep track of streetwear pieces you plan to grab next.</p>
      </div>

      <router-link to="/shop" class="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1">
        <i class="fa-solid fa-shirt"></i> <span>Browse more</span>
      </router-link>
    </div>

    <!-- Empty Wishlist -->
    <div v-if="items.length === 0" class="py-24 text-center border border-[var(--border)] p-8 space-y-4 rounded-sm">
      <div class="w-16 h-16 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] mx-auto flex items-center justify-center text-2xl">
        <i class="fa-regular fa-heart"></i>
      </div>
      <h3 class="font-bold text-[var(--text)] text-base">Your wishlist is empty</h3>
      <p class="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
        Tap the heart icon on any t-shirt or hoodie in our store to save it here for later.
      </p>
      <router-link
        to="/shop"
        class="inline-block mt-2 px-6 py-2.5 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs transition-colors"
      >
        Explore t-shirts
      </router-link>
    </div>

    <!-- Wishlist Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="product in items"
        :key="product.id"
        class="group border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-sm transition-all duration-200 flex flex-col rounded-sm"
      >
        <div class="relative bg-[var(--bg-alt)] aspect-square overflow-hidden">
          <router-link :to="`/product/${product.id}`">
            <img :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </router-link>

          <button
            @click="removeFromWishlist(product.id)"
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[var(--accent)] hover:bg-[var(--accent-soft)] flex items-center justify-center text-xs border border-[var(--border)] hover:scale-110 transition-all cursor-pointer"
            title="Remove from wishlist"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <span class="text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-wider">{{ product.categoryName }}</span>
            <router-link :to="`/product/${product.id}`">
              <h3 class="font-bold text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-1 mt-0.5">
                {{ product.name }}
              </h3>
            </router-link>
            <p class="font-extrabold text-sm text-[var(--text)] mt-2">${{ product.price.toFixed(2) }}</p>
          </div>

          <div class="divider pt-2 flex items-center gap-2">
            <button
              @click="moveToCart(product)"
              class="flex-1 py-2 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-bag-shopping"></i>
              <span>Move to bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { quickAddOrChoose } from '@/functions/quickAdd';

export default {
  name: 'Wishlist',
  setup() {
    const store = useStore();
    const router = useRouter();

    const items = computed(() => store.getters['wishlist/wishlistItems']);

    const removeFromWishlist = (productId) => {
      store.dispatch('wishlist/removeFromWishlist', productId);
    };

    const moveToCart = (product) => {
      // Only leaves the wishlist once it's actually in the bag
      if (quickAddOrChoose(store, router, product)) {
        store.dispatch('wishlist/removeFromWishlist', product.id);
      }
    };

    return {
      items,
      removeFromWishlist,
      moveToCart
    };
  }
};
</script>
