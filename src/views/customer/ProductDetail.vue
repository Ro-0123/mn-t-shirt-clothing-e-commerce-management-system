<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-[var(--text-faint)] mb-8">
      <router-link to="/" class="hover:text-[var(--accent)]">Home</router-link>
      <span>/</span>
      <router-link to="/shop" class="hover:text-[var(--accent)]">Shop</router-link>
      <span>/</span>
      <span class="text-[var(--text)] font-semibold truncate">{{ product?.name || 'Loading...' }}</span>
    </nav>

    <div v-if="isLoading" class="py-24 text-center space-y-3">
      <div class="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-semibold text-[var(--text-muted)]">Loading product details...</p>
    </div>

    <div v-else-if="!product" class="text-center py-20 border border-[var(--border)] p-8 rounded-sm">
      <h3 class="font-bold text-[var(--text)] text-lg">Product Not Found</h3>
      <router-link to="/shop" class="inline-block mt-4 px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs rounded-sm">
        Return to Shop
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Left: Image Gallery -->
      <div class="lg:col-span-7 space-y-4">
        <!-- Main Image -->
        <div
          class="relative bg-[var(--bg-alt)] overflow-hidden aspect-4/3 border border-[var(--border)] rounded-sm select-none"
          tabindex="0"
          @keydown.left.prevent="prevImage"
          @keydown.right.prevent="nextImage"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
        >
          <img
            :src="activeImage"
            :alt="product.name"
            class="w-full h-full object-cover transition-all duration-300"
            draggable="false"
          />

          <!-- Prev / Next arrows (only when there are multiple images) -->
          <template v-if="hasMultipleImages">
            <button
              @click="prevImage"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/85 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous image"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button
              @click="nextImage"
              class="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/85 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next image"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
            <span class="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-[11px] font-semibold rounded-sm">
              {{ activeIndex + 1 }} / {{ product.images.length }}
            </span>
          </template>

          <div class="absolute top-4 left-4 flex flex-col gap-2">
            <span v-if="product.discountPercentage > 0" class="px-2.5 py-1 bg-[var(--accent)] text-white font-black text-xs uppercase tracking-wider rounded-sm">
              {{ product.discountPercentage }}% off
            </span>
            <span v-if="product.isBestSeller" class="px-2.5 py-1 bg-white border border-[var(--border-strong)] text-[var(--text)] font-bold text-xs uppercase tracking-wider rounded-sm">
              Best seller
            </span>
          </div>
        </div>

        <!-- Thumbnails -->
        <div class="flex gap-3 overflow-x-auto pb-2">
          <button
            v-for="(img, idx) in product.images"
            :key="idx"
            @click="activeImage = img"
            :class="activeImage === img ? 'ring-2 ring-[var(--accent)]' : 'opacity-60 hover:opacity-100'"
            class="w-20 h-20 overflow-hidden bg-[var(--bg-alt)] border border-[var(--border)] flex-shrink-0 transition-all cursor-pointer rounded-sm"
          >
            <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Product Specs -->
        <div class="divider grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div class="p-4 border border-[var(--border)] rounded-sm">
            <p class="font-bold text-[var(--text)] mb-1"><i class="fa-solid fa-layer-group text-[var(--accent)] mr-1.5"></i> Fabric</p>
            <p class="text-[var(--text-muted)]">{{ product.fabric }}</p>
          </div>
          <div class="p-4 border border-[var(--border)] rounded-sm">
            <p class="font-bold text-[var(--text)] mb-1"><i class="fa-solid fa-person text-[var(--accent)] mr-1.5"></i> Fit style</p>
            <p class="text-[var(--text-muted)]">{{ product.fit }}</p>
          </div>
          <div class="p-4 border border-[var(--border)] rounded-sm">
            <p class="font-bold text-[var(--text)] mb-1"><i class="fa-solid fa-shield-halved text-[var(--accent)] mr-1.5"></i> Guarantee</p>
            <p class="text-[var(--text-muted)]">14-day free exchange</p>
          </div>
        </div>
      </div>

      <!-- Right: Product Purchase Panel -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Category & SKU -->
        <div class="flex items-center justify-between text-xs text-[var(--text-faint)]">
          <span class="font-bold uppercase tracking-wider text-[var(--accent)]">{{ product.categoryName }}</span>
          <span class="font-mono text-[var(--text-faint)]">SKU: {{ product.sku }}</span>
        </div>

        <!-- Title -->
        <h1 class="font-display text-3xl sm:text-4xl text-[var(--text)] leading-[1.1]">
          {{ product.name }}
        </h1>

        <!-- Price block -->
        <div class="p-4 border border-[var(--border)] flex items-baseline gap-3 rounded-sm">
          <span class="text-3xl font-black text-[var(--text)]">${{ product.price.toFixed(2) }}</span>
          <span v-if="product.originalPrice > product.price" class="text-base text-[var(--text-faint)] line-through">
            ${{ product.originalPrice.toFixed(2) }}
          </span>
          <span v-if="product.discountPercentage > 0" class="text-xs font-bold text-[var(--accent)] ml-auto">
            Save ${{ (product.originalPrice - product.price).toFixed(2) }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          {{ product.description }}
        </p>

        <!-- Stock Indicator -->
        <div class="flex items-center gap-2 text-xs">
          <span
            class="w-2.5 h-2.5 rounded-full"
            :class="product.stock > product.minStockLevel ? 'bg-[var(--text)]' : 'bg-[var(--accent)]'"
          ></span>
          <span v-if="product.stock > product.minStockLevel" class="text-[var(--text)] font-bold">
            In stock ({{ product.stock }} items available in Phnom Penh hub)
          </span>
          <span v-else class="text-[var(--accent)] font-bold">
            Low stock &mdash; only {{ product.stock }} left in store!
          </span>
        </div>

        <!-- Size Selector -->
        <div class="divider space-y-2.5 pt-4">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-[var(--text)]">Select size: <strong class="text-[var(--accent)]">{{ selectedSize || 'Choose one' }}</strong></span>
            <button class="text-[var(--text-muted)] hover:text-[var(--accent)] font-medium underline cursor-pointer">Size guide</button>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="size in product.sizes"
              :key="size"
              @click="selectedSize = size"
              :class="selectedSize === size ? 'bg-[var(--text)] text-white font-bold' : 'border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'"
              class="w-12 h-11 rounded-sm text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Color Selector -->
        <div class="divider space-y-2.5 pt-4">
          <span class="font-bold text-xs text-[var(--text)] block">Select color: <strong class="text-[var(--accent)]">{{ selectedColor || 'Choose one' }}</strong></span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in product.colors"
              :key="color"
              @click="selectedColor = color"
              :class="selectedColor === color ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'"
              class="px-3 py-1.5 rounded-sm border text-xs transition-colors cursor-pointer"
            >
              {{ color }}
            </button>
          </div>
        </div>

        <!-- Quantity & Add to Cart -->
        <div class="divider space-y-3 pt-5">
          <div class="flex items-center gap-3">
            <!-- Qty Selector -->
            <div class="flex items-center border border-[var(--border)] rounded-sm overflow-hidden h-12">
              <button
                @click="quantity = Math.max(1, quantity - 1)"
                class="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)] transition-colors font-bold text-sm cursor-pointer"
              >
                -
              </button>
              <span class="px-4 font-bold text-sm text-[var(--text)]">{{ quantity }}</span>
              <button
                @click="quantity = Math.min(product.stock, quantity + 1)"
                class="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)] transition-colors font-bold text-sm cursor-pointer"
              >
                +
              </button>
            </div>

            <!-- Add to Bag Button -->
            <button
              @click="handleAddToCart"
              class="flex-1 h-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-bag-shopping"></i>
              <span>Add to bag &middot; ${{ (product.price * quantity).toFixed(2) }}</span>
            </button>

            <!-- Wishlist Button -->
            <button
              @click="toggleWishlist"
              class="w-12 h-12 rounded-sm border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center text-lg transition-all cursor-pointer"
              :title="isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'"
            >
              <i :class="isInWishlist ? 'fa-solid fa-heart text-[var(--accent)]' : 'fa-regular fa-heart'"></i>
            </button>
          </div>

          <!-- Fast Checkout Button -->
          <button
            @click="handleBuyNow"
            class="w-full py-3 border border-[var(--border)] hover:border-[var(--text)] text-[var(--text)] rounded-sm font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <i class="fa-solid fa-bolt text-[var(--accent)]"></i>
            <span>Instant buy now</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>


<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { ErrorToast } from '@/functions/sweetalert';

export default {
  name: 'ProductDetail',
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const activeImage = ref('');
    const selectedSize = ref('');
    const selectedColor = ref('');
    const quantity = ref(1);

    const product = computed(() => store.getters['products/allProducts'].find(p => p.id === parseInt(route.params.id)) || store.state.products.currentProduct);
    const isLoading = computed(() => store.getters['products/isLoading']);
    const isInWishlist = computed(() => product.value ? store.getters['wishlist/isInWishlist'](product.value.id) : false);

    // Image gallery navigation
    const images = computed(() => product.value?.images || []);
    const hasMultipleImages = computed(() => images.value.length > 1);
    const activeIndex = computed(() => Math.max(0, images.value.indexOf(activeImage.value)));

    const showImageAt = (idx) => {
      const len = images.value.length;
      if (!len) return;
      activeImage.value = images.value[(idx + len) % len];
    };
    const prevImage = () => showImageAt(activeIndex.value - 1);
    const nextImage = () => showImageAt(activeIndex.value + 1);

    let touchStartX = 0;
    const onTouchStart = (e) => {
      touchStartX = e.changedTouches[0].clientX;
    };
    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return;
      dx > 0 ? prevImage() : nextImage();
    };

    const loadProduct = async () => {
      const id = route.params.id;
      const data = await store.dispatch('products/fetchProductById', id);
      if (data) {
        activeImage.value = data.images?.[0] || '';
        // Nothing is pre-selected, so customers pick their own size and colour
        // (only auto-picked when there is just one option)
        selectedSize.value = data.sizes?.length === 1 ? data.sizes[0] : '';
        selectedColor.value = data.colors?.length === 1 ? data.colors[0] : '';
      }
    };

    onMounted(() => {
      loadProduct();
    });

    watch(() => route.params.id, () => {
      loadProduct();
    });

    const choicesMade = () => {
      const needSize = (product.value?.sizes?.length || 0) > 0 && !selectedSize.value;
      const needColor = (product.value?.colors?.length || 0) > 0 && !selectedColor.value;
      if (needSize || needColor) {
        ErrorToast(
          'Please choose',
          needSize && needColor ? 'Select a size and a color first.' : needSize ? 'Select a size first.' : 'Select a color first.'
        );
        return false;
      }
      return true;
    };

    const handleAddToCart = () => {
      if (!product.value || !choicesMade()) return;
      store.dispatch('cart/addToCart', {
        product: product.value,
        size: selectedSize.value,
        color: selectedColor.value,
        quantity: quantity.value,
        openDrawer: true
      });
    };

    const handleBuyNow = async () => {
      if (!product.value || !choicesMade()) return;
      const added = await store.dispatch('cart/addToCart', {
        product: product.value,
        size: selectedSize.value,
        color: selectedColor.value,
        quantity: quantity.value,
        openDrawer: false
      });
      if (added) router.push('/checkout');
    };

    const toggleWishlist = () => {
      if (product.value) {
        store.dispatch('wishlist/toggleWishlist', product.value);
      }
    };

    return {
      product,
      isLoading,
      activeImage,
      activeIndex,
      hasMultipleImages,
      prevImage,
      nextImage,
      onTouchStart,
      onTouchEnd,
      selectedSize,
      selectedColor,
      quantity,
      isInWishlist,
      handleAddToCart,
      handleBuyNow,
      toggleWishlist
    };
  }
};
</script>
