<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Main Layout: Filters Sidebar + Products Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <!-- Filters Sidebar (Desktop) & Mobile Drawer -->
      <aside class="space-y-5">
        <!-- Search input -->
        <div class="p-5 border border-[var(--border)] space-y-3 rounded-sm">
          <h3 class="font-bold text-xs uppercase tracking-wider text-[var(--text)]">Search products</h3>
          <div class="relative">
            <input
              type="text"
              v-model="search"
              @input="applyFilters"
              placeholder="Search by name, fabric, style..."
              class="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)]"
            />
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[var(--text-faint)] text-xs"></i>
          </div>
        </div>

        <!-- Categories List -->
        <div class="p-5 border border-[var(--border)] space-y-3 rounded-sm">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-xs uppercase tracking-wider text-[var(--text)]">Categories</h3>
            <button
              v-if="selectedCategory"
              @click="selectCategory('')"
              class="text-[11px] text-[var(--accent)] hover:underline font-semibold cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div class="space-y-1 text-xs">
            <button
              @click="selectCategory('')"
              :class="!selectedCategory ? 'bg-[var(--accent-soft)] border-[var(--accent)]/30 text-[var(--accent)] font-bold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] border-transparent'"
              class="w-full text-left px-3 py-2 border rounded-sm transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>All Apparel & Accessories</span>
              <span class="text-[10px] opacity-70">{{ allProductsCount }}</span>
            </button>

            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectCategory(cat.slug)"
              :class="selectedCategory === cat.slug ? 'bg-[var(--accent-soft)] border-[var(--accent)]/30 text-[var(--accent)] font-bold' : 'text-[var(--text-muted)] hover:bg-[var(--bg-alt)] border-transparent'"
              class="w-full text-left px-3 py-2 border rounded-sm transition-colors flex items-center justify-between cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <i :class="`fa-solid ${cat.icon} text-[var(--text-faint)] w-4 text-center`"></i>
                <span class="truncate">{{ cat.name }}</span>
              </div>
              <span class="text-[10px] opacity-70">{{ cat.itemCount }}</span>
            </button>
          </div>
        </div>

        <!-- Reset All Button -->
        <button
          @click="resetAllFilters"
          class="w-full py-2.5 px-4 rounded-sm border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text)] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <i class="fa-solid fa-arrow-rotate-left text-xs"></i>
          <span>Clear all filters</span>
        </button>
      </aside>

      <!-- Products Content Area -->
      <div ref="productsSection" class="lg:col-span-3 space-y-5">

        <!-- Controls Bar (Sorting & Layout) -->
        <div class="p-4 border border-[var(--border)] flex flex-wrap items-center justify-between gap-4 rounded-sm">
          <div class="text-xs text-[var(--text-muted)]">
            Showing <strong class="text-[var(--text)]">{{ products.length }}</strong> products
          </div>

          <div class="flex items-center gap-3">
            <label for="sort-select" class="text-xs font-semibold text-[var(--text-muted)]">Sort by:</label>
            <select
              id="sort-select"
              v-model="sortBy"
              @change="applyFilters"
              class="text-xs bg-white border border-[var(--border)] rounded-sm px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] text-[var(--text)] font-medium"
            >
              <option value="newest">Newest arrivals</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="py-20 text-center space-y-3">
          <div class="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs font-semibold text-[var(--text-muted)]">Loading MN T-Shirt products...</p>
        </div>

        <!-- Empty Results State -->
        <div v-else-if="products.length === 0" class="border border-[var(--border)] p-12 text-center space-y-4 rounded-sm">
          <div class="w-16 h-16 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-faint)] mx-auto flex items-center justify-center text-2xl">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <h3 class="font-bold text-[var(--text)] text-base">No shirts match your filters</h3>
          <p class="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            @click="resetAllFilters"
            class="px-5 py-2 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs transition-colors"
          >
            Reset filters
          </button>
        </div>

        <!-- Products Grouped by Category (shown when "All Apparel & Accessories" is selected) -->
        <div v-else-if="!selectedCategory" class="space-y-10">
          <div v-for="group in groupedByCategory" :key="group.category.id" class="space-y-4">
            <div class="flex items-end justify-between">
              <div>
                <h2 class="font-display text-xl text-[var(--text)]">{{ group.category.name }}</h2>
                <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ group.products.length }} products</p>
              </div>
              <button
                @click="viewAllCategory(group.category.slug)"
                class="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <span>View all</span> <i class="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>

            <div class="relative">
              <button
                v-show="rowScrollState[group.category.slug]?.left"
                @click="scrollCategoryRow(group.category.slug, -1)"
                aria-label="Previous products"
                class="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--text)] hover:bg-[var(--accent)] text-white items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <i class="fa-solid fa-chevron-left text-xs"></i>
              </button>

              <button
                v-show="rowScrollState[group.category.slug]?.right"
                @click="scrollCategoryRow(group.category.slug, 1)"
                aria-label="Next products"
                class="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[var(--text)] hover:bg-[var(--accent)] text-white items-center justify-center shadow-lg transition-colors cursor-pointer"
              >
                <i class="fa-solid fa-chevron-right text-xs"></i>
              </button>

              <div
                :ref="el => setRowRef(group.category.slug, el)"
                @scroll="updateCategoryScrollState(group.category.slug)"
                class="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
              >
                <ProductCard
                  v-for="product in group.products"
                  :key="product.id"
                  :product="product"
                  class="flex-shrink-0 w-[220px] sm:w-[250px] snap-start"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Products Grid (shown when a specific category is selected) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

      </div>

    </div>
  </div>
</template>


<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import ProductCard from '@/components/includes/ProductCard.vue';

export default {
  name: 'Shop',
  components: { ProductCard },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const search = ref('');
    const selectedCategory = ref('');
    const sortBy = ref('newest');

    const products = computed(() => store.getters['products/allProducts']);
    const categories = computed(() => store.getters['products/allCategories']);
    const isLoading = computed(() => store.getters['products/isLoading']);
    const allProductsCount = computed(() => store.getters['products/allProducts'].length);

    const groupedByCategory = computed(() => {
      return categories.value
        .map((cat) => ({
          category: cat,
          products: products.value.filter((p) => p.categorySlug === cat.slug)
        }))
        .filter((group) => group.products.length > 0);
    });

    // Horizontal scroll rows for the "All Apparel & Accessories" grouped view
    const rowRefs = {};
    const rowScrollState = reactive({});

    const setRowRef = (slug, el) => {
      if (el) rowRefs[slug] = el;
    };

    const updateCategoryScrollState = (slug) => {
      const el = rowRefs[slug];
      if (!el) return;
      rowScrollState[slug] = {
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4
      };
    };

    const scrollCategoryRow = (slug, direction) => {
      const el = rowRefs[slug];
      if (!el) return;
      const cardWidth = el.querySelector(':scope > *')?.offsetWidth || 250;
      el.scrollBy({ left: direction * (cardWidth + 20) * 2, behavior: 'smooth' });
    };

    watch(groupedByCategory, (groups) => {
      nextTick(() => groups.forEach((g) => updateCategoryScrollState(g.category.slug)));
    });

    const applyFilters = () => {
      store.dispatch('products/fetchProducts', {
        search: search.value,
        category: selectedCategory.value,
        sort: sortBy.value
      });
    };

    const selectCategory = (slug) => {
      selectedCategory.value = slug;
      router.push({ path: '/shop', query: { ...route.query, category: slug || undefined } });
      applyFilters();
    };

    const productsSection = ref(null);

    const viewAllCategory = (slug) => {
      selectCategory(slug);
      nextTick(() => productsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };

    const resetAllFilters = () => {
      search.value = '';
      selectedCategory.value = '';
      sortBy.value = 'newest';
      router.push('/shop');
      store.dispatch('products/fetchProducts');
    };

    // Sync route query parameters
    watch(
      () => route.query,
      (newQuery) => {
        if (newQuery.category !== undefined) {
          selectedCategory.value = newQuery.category;
        }
        if (newQuery.search !== undefined) {
          search.value = newQuery.search;
        }
        applyFilters();
      },
      { immediate: true }
    );

    onMounted(() => {
      store.dispatch('products/fetchCategories');
      if (route.query.category) selectedCategory.value = route.query.category;
      if (route.query.search) search.value = route.query.search;
      applyFilters();
    });

    return {
      search,
      selectedCategory,
      sortBy,
      products,
      categories,
      isLoading,
      allProductsCount,
      groupedByCategory,
      rowScrollState,
      setRowRef,
      updateCategoryScrollState,
      scrollCategoryRow,
      applyFilters,
      selectCategory,
      productsSection,
      viewAllCategory,
      resetAllFilters
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
