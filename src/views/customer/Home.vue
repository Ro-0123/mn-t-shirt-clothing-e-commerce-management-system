<template>
  <div class="pb-12">
    <!-- Hero Banner -->
    <section class="surface-alt border-b border-[var(--border)]">
      <div class="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Text Column -->
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-strong)] text-[var(--text-muted)] text-xs font-bold tracking-wide uppercase">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
            Drop 03 &middot; 2026 Heavyweight Collection
          </div>

          <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl text-[var(--text)] leading-[1.02]">
            Crafted for the streets.
          </h1>

          <p class="text-sm sm:text-base text-[var(--text-muted)] max-w-xl leading-relaxed">
            280+ GSM organic combed cotton, drop-shoulder oversized silhouettes, and vivid screen-printed artwork &mdash; engineered and run in small batches right here in Phnom Penh.
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            <router-link
              to="/shop"
              class="px-7 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-colors flex items-center gap-2 group cursor-pointer rounded-sm"
            >
              <span>Shop the drop</span>
              <i class="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
            </router-link>

            <router-link
              :to="{ path: '/shop', query: { category: 'oversized-streetwear' } }"
              class="px-6 py-3.5 border border-[var(--border-strong)] hover:border-[var(--text)] text-[var(--text)] font-semibold text-sm transition-all rounded-sm"
            >
              Oversized fits
            </router-link>
          </div>

          <!-- Feature badges -->
          <div class="divider grid grid-cols-3 gap-4 pt-6 max-w-lg text-xs">
            <div>
              <p class="font-display text-lg text-[var(--text)]">280 GSM</p>
              <p class="text-[11px] text-[var(--text-muted)]">Heavyweight cotton</p>
            </div>
            <div>
              <p class="font-display text-lg text-[var(--text)]">100%</p>
              <p class="text-[11px] text-[var(--text-muted)]">Organic combed</p>
            </div>
            <div>
              <p class="font-display text-lg text-[var(--text)]">14 days</p>
              <p class="text-[11px] text-[var(--text-muted)]">Easy exchanges</p>
            </div>
          </div>
        </div>

        <!-- Image Showcase -->
        <div class="lg:col-span-5 relative">
          <div class="relative mx-auto max-w-sm overflow-hidden border border-[var(--border)] rounded-sm">
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
              alt="MN Heavyweight Boxy Tee"
              class="w-full h-96 sm:h-[440px] object-cover"
            />

            <div class="p-4 bg-white border-t border-[var(--border)] flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)]">Featured drop</span>
                <p class="font-bold text-sm text-[var(--text)]">MN Heavyweight Boxy Tee</p>
                <p class="text-xs text-[var(--text-muted)]">$24.99 <span class="line-through ml-1.5">$32.00</span></p>
              </div>
              <router-link
                to="/product/1"
                class="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs transition-colors rounded-sm flex-shrink-0"
              >
                View
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Best Sellers / Featured Products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div class="flex items-end justify-between mb-8">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Trending now</span>
          <h2 class="font-display text-2xl sm:text-3xl text-[var(--text)]">Best selling t-shirts</h2>
        </div>
        <router-link to="/shop" class="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1">
          <span>See more</span> <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </router-link>
      </div>

      <div class="relative">
        <!-- Scroll left -->
        <button
          v-show="canScrollLeft"
          @click="scrollRow(-1)"
          aria-label="Previous products"
          class="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--text)] hover:bg-[var(--accent)] text-white items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>

        <!-- Scroll right -->
        <button
          v-show="canScrollRight"
          @click="scrollRow(1)"
          aria-label="Next products"
          class="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--text)] hover:bg-[var(--accent)] text-white items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>

        <div
          ref="productRow"
          @scroll="updateScrollState"
          class="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        >
        <div
          v-for="product in bestSellers"
          :key="product.id"
          class="group border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-sm transition-all duration-200 flex flex-col rounded-sm flex-shrink-0 w-[220px] sm:w-[250px] snap-start"
        >
          <!-- Product Image Container -->
          <div class="relative overflow-hidden bg-[var(--bg-alt)] aspect-square">
            <router-link :to="`/product/${product.id}`">
              <img
                :src="product.images[0]"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </router-link>

            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-1.5">
              <span v-if="product.discountPercentage > 0" class="px-2 py-0.5 bg-[var(--accent)] text-white font-black text-[10px] uppercase tracking-wider rounded-sm">
                -{{ product.discountPercentage }}%
              </span>
              <span v-if="product.isBestSeller" class="px-2 py-0.5 bg-white border border-[var(--border-strong)] text-[var(--text)] font-black text-[10px] uppercase tracking-wider rounded-sm">
                Top pick
              </span>
            </div>

            <!-- Wishlist button -->
            <button
              @click="toggleWishlist(product)"
              class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border)] flex items-center justify-center text-xs hover:scale-110 transition-all cursor-pointer"
              :title="isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'"
            >
              <i :class="isInWishlist(product.id) ? 'fa-solid fa-heart text-[var(--accent)]' : 'fa-regular fa-heart'"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <span class="text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-wider">{{ product.categoryName }}</span>
              <router-link :to="`/product/${product.id}`">
                <h3 class="font-bold text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-1 mt-0.5">
                  {{ product.name }}
                </h3>
              </router-link>
            </div>

            <div class="divider flex items-center justify-between pt-2">
              <div>
                <span class="font-extrabold text-base text-[var(--text)]">${{ product.price.toFixed(2) }}</span>
                <span v-if="product.originalPrice > product.price" class="text-xs text-[var(--text-faint)] line-through ml-1.5">
                  ${{ product.originalPrice.toFixed(2) }}
                </span>
              </div>

              <!-- Quick Add to Bag -->
              <button
                @click="quickAddToCart(product)"
                class="p-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors cursor-pointer text-xs rounded-sm"
                title="Add to Shopping Bag"
              >
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div class="flex items-end justify-between mb-8">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)]">Curated lines</span>
          <h2 class="font-display text-2xl sm:text-3xl text-[var(--text)]">Shop by category</h2>
        </div>
        <router-link to="/shop" class="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1">
          <span>View all</span> <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <router-link
          v-for="cat in categories"
          :key="cat.id"
          :to="{ path: '/shop', query: { category: cat.slug } }"
          class="group p-5 border border-[var(--border)] hover:border-[var(--text)] transition-all duration-200 flex flex-col justify-between rounded-sm"
        >
          <div class="w-10 h-10 rounded-full border border-[var(--border-strong)] text-[var(--text-muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] flex items-center justify-center text-lg transition-colors">
            <i :class="`fa-solid ${cat.icon}`"></i>
          </div>
          <div class="mt-6">
            <h3 class="font-bold text-sm text-[var(--text)]">{{ cat.name }}</h3>
            <p class="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{{ cat.description }}</p>
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)]">
              <span>{{ cat.itemCount || 8 }} products</span>
              <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Why MN T-Shirt Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-6 border border-[var(--border)] space-y-3 rounded-sm">
          <div class="w-10 h-10 border border-[var(--border-strong)] text-[var(--text)] flex items-center justify-center text-lg rounded-full">
            <i class="fa-solid fa-feather"></i>
          </div>
          <h4 class="font-bold text-base text-[var(--text)]">Zero shrinkage fabric</h4>
          <p class="text-xs text-[var(--text-muted)] leading-relaxed">
            Pre-shrunk ring-spun and organic combed cotton that preserves its shape and neck ribbing through dozens of machine washes.
          </p>
        </div>

        <div class="p-6 border border-[var(--border)] space-y-3 rounded-sm">
          <div class="w-10 h-10 border border-[var(--border-strong)] text-[var(--text)] flex items-center justify-center text-lg rounded-full">
            <i class="fa-solid fa-truck-fast"></i>
          </div>
          <h4 class="font-bold text-base text-[var(--text)]">Fast nationwide dispatch</h4>
          <p class="text-xs text-[var(--text-muted)] leading-relaxed">
            Orders packaged with care and dispatched via MN Express Dispatch and J&amp;T for 24-48h delivery across all provinces.
          </p>
        </div>

        <div class="p-6 border border-[var(--border)] space-y-3 rounded-sm">
          <div class="w-10 h-10 border border-[var(--border-strong)] text-[var(--text)] flex items-center justify-center text-lg rounded-full">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <h4 class="font-bold text-base text-[var(--text)]">Secure payment options</h4>
          <p class="text-xs text-[var(--text-muted)] leading-relaxed">
            Instant KHQR scan with ABA Bank, Visa/Mastercard processing, or pay with your store credit balance.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>


<script>
import { computed, onMounted, nextTick, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { quickAddOrChoose } from '@/functions/quickAdd';

export default {
  name: 'Home',
  setup() {
    const store = useStore();
    const router = useRouter();

    const categories = computed(() => store.getters['products/allCategories']);
    const bestSellers = computed(() => store.getters['products/bestSellers']);
    const isInWishlist = (id) => store.getters['wishlist/isInWishlist'](id);

    const productRow = ref(null);
    const canScrollLeft = ref(false);
    const canScrollRight = ref(false);

    const updateScrollState = () => {
      const el = productRow.value;
      if (!el) return;
      canScrollLeft.value = el.scrollLeft > 4;
      canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    };

    const scrollRow = (direction) => {
      const el = productRow.value;
      if (!el) return;
      const cardWidth = el.querySelector(':scope > *')?.offsetWidth || 250;
      el.scrollBy({ left: direction * (cardWidth + 20) * 2, behavior: 'smooth' });
    };

    onMounted(() => {
      store.dispatch('products/fetchProducts');
      store.dispatch('products/fetchCategories');
      nextTick(updateScrollState);
    });

    watch(bestSellers, () => nextTick(updateScrollState));

    const toggleWishlist = (product) => {
      store.dispatch('wishlist/toggleWishlist', product);
    };

    const quickAddToCart = (product) => {
      quickAddOrChoose(store, router, product);
    };

    return {
      categories,
      bestSellers,
      isInWishlist,
      toggleWishlist,
      quickAddToCart,
      productRow,
      canScrollLeft,
      canScrollRight,
      updateScrollState,
      scrollRow
    };
  }
};
</script>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
