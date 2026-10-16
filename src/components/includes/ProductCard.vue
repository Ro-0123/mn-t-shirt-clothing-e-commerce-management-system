<template>
  <div class="group border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-sm transition-all duration-200 flex flex-col rounded-sm">
    <!-- Image Area -->
    <div class="relative overflow-hidden bg-[var(--bg-alt)] aspect-[3/4]">
      <router-link :to="`/product/${product.id}`">
        <img
          v-if="product.images?.[0]"
          :src="product.images[0]"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-[var(--text-faint)]">
          <i class="fa-solid fa-shirt text-4xl"></i>
        </div>
      </router-link>

      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-1.5">
        <span v-if="product.discountPercentage > 0" class="px-2 py-0.5 bg-[var(--accent)] text-white font-black text-[10px] uppercase rounded-sm">
          -{{ product.discountPercentage }}%
        </span>
        <span v-if="product.stock <= product.minStockLevel" class="px-2 py-0.5 bg-white border border-[var(--border-strong)] text-[var(--text)] font-bold text-[10px] uppercase rounded-sm">
          Low stock
        </span>
      </div>

      <!-- Wishlist toggle -->
      <button
        @click="toggleWishlist"
        class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border)] flex items-center justify-center text-xs hover:scale-110 transition-all cursor-pointer"
        :title="isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'"
      >
        <i :class="isInWishlist ? 'fa-solid fa-heart text-[var(--accent)]' : 'fa-regular fa-heart'"></i>
      </button>
    </div>

    <!-- Details -->
    <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
      <div>
        <div class="flex items-center justify-between text-[11px] text-[var(--text-faint)]">
          <span class="font-semibold uppercase tracking-wider">{{ product.categoryName }}</span>
          <span>SKU: {{ product.sku }}</span>
        </div>

        <router-link :to="`/product/${product.id}`">
          <h3 class="font-bold text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-1 mt-1">
            {{ product.name }}
          </h3>
        </router-link>

        <!-- Fabric & Fit badge -->
        <p class="text-[11px] text-[var(--text-faint)] mt-1 line-clamp-1">
          {{ product.fabric }}
        </p>
      </div>

      <!-- Price & CTA -->
      <div class="divider flex items-center justify-between pt-2">
        <div>
          <span class="font-extrabold text-base text-[var(--text)]">${{ Number(product.price || 0).toFixed(2) }}</span>
          <span v-if="Number(product.originalPrice || 0) > Number(product.price || 0)" class="text-xs text-[var(--text-faint)] line-through ml-1.5">
            ${{ Number(product.originalPrice || 0).toFixed(2) }}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <router-link
            :to="`/product/${product.id}`"
            class="px-2.5 py-1.5 rounded-sm bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)] font-semibold text-xs transition-colors"
          >
            Details
          </router-link>
          <button
            @click.stop.prevent="quickAddToCart"
            class="p-2 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors cursor-pointer text-xs"
            title="Add to Shopping Bag"
          >
            <i class="fa-solid fa-bag-shopping"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ProductCard',
  props: {
    product: { type: Object, required: true },
  },
  setup(props) {
    const store = useStore();

    const isInWishlist = computed(() => store.getters['wishlist/isInWishlist'](props.product.id));

    const toggleWishlist = () => {
      store.dispatch('wishlist/toggleWishlist', props.product);
    };

    const quickAddToCart = () => {
      store.dispatch('cart/addToCart', {
        product: props.product,
        size: props.product.sizes?.[0] || 'M',
        color: props.product.colors?.[0] || 'Black',
        quantity: 1,
        openDrawer: true,
      });
    };

    return { isInWishlist, toggleWishlist, quickAddToCart };
  },
};
</script>
