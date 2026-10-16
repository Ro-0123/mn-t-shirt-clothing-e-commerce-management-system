<template>
  <div v-if="isOpen" class="storefront fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      @click="closeDrawer"
      class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md surface border-l border-[var(--border)] shadow-xl flex flex-col animate-in slide-in-from-right duration-200">

        <!-- Header -->
        <div class="p-4 sm:p-6 border-b border-[var(--border)] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-bag-shopping text-[var(--accent)] text-lg"></i>
            <h3 class="font-display text-base text-[var(--text)]">Your Bag</h3>
            <span class="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-bold">
              {{ totalCount }} items
            </span>
          </div>
          <button
            @click="closeDrawer"
            class="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-sm hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Free shipping bar -->
        <div class="surface-alt px-4 py-2.5 border-b border-[var(--border)] text-xs text-[var(--text-muted)] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-truck-fast text-[var(--text-faint)]"></i>
            <span v-if="subtotal >= 50" class="font-semibold text-[var(--text)]">
              Free shipping unlocked
            </span>
            <span v-else>
              Add <strong class="text-[var(--text)]">${{ (50 - subtotal).toFixed(2) }}</strong> more for <strong class="text-[var(--text)]">free delivery</strong>
            </span>
          </div>
          <div class="w-20 bg-[var(--border)] rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-[var(--accent)] h-full rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Items list -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div v-if="items.length === 0" class="py-16 text-center space-y-3">
            <div class="w-16 h-16 bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-faint)] mx-auto flex items-center justify-center text-2xl rounded-sm">
              <i class="fa-solid fa-cart-arrow-down"></i>
            </div>
            <h4 class="font-bold text-[var(--text)] text-sm">Your bag is empty</h4>
            <p class="text-xs text-[var(--text-muted)] max-w-xs mx-auto">Explore our heavyweight tees, oversized fits, and fleece hoodies.</p>
            <router-link
              to="/shop"
              @click="closeDrawer"
              class="inline-block mt-2 px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs uppercase tracking-wide transition-colors rounded-sm"
            >
              Start Shopping
            </router-link>
          </div>

          <div
            v-for="(item, idx) in items"
            :key="`${item.productId}-${item.size}-${item.color}-${idx}`"
            class="flex gap-4 p-3 border border-[var(--border)] rounded-sm"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-20 h-20 object-cover bg-[var(--bg-alt)] flex-shrink-0 rounded-sm"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between gap-1">
                  <h4 class="font-bold text-xs text-[var(--text)] truncate leading-snug">{{ item.name }}</h4>
                  <button
                    @click="removeItem(item)"
                    class="text-[var(--text-faint)] hover:text-[var(--accent)] text-xs transition-colors p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
                <div class="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)]">
                  <span class="px-1.5 py-0.5 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)]">Size: {{ item.size }}</span>
                  <span class="px-1.5 py-0.5 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)]">{{ item.color }}</span>
                </div>
              </div>

              <div class="divider flex items-center justify-between mt-2 pt-2">
                <span class="font-extrabold text-sm text-[var(--text)]">${{ (item.price * item.quantity).toFixed(2) }}</span>

                <!-- Qty buttons -->
                <div class="flex items-center border border-[var(--border)] rounded-sm overflow-hidden">
                  <button
                    @click="updateQty(item, item.quantity - 1)"
                    class="px-2 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span class="px-2.5 py-0.5 text-xs font-bold text-[var(--text)]">{{ item.quantity }}</span>
                  <button
                    @click="updateQty(item, item.quantity + 1)"
                    class="px-2 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Checkout button -->
        <div v-if="items.length > 0" class="p-4 sm:p-6 border-t border-[var(--border)] surface-alt space-y-3">
          <!-- Subtotal summary -->
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between text-[var(--text-muted)]">
              <span>Subtotal</span>
              <span class="font-semibold text-[var(--text)]">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="discountAmount > 0" class="flex justify-between text-[var(--accent)] font-medium">
              <span>Promo Discount (20%)</span>
              <span>-${{ discountAmount.toFixed(2) }}</span>
            </div>
            <div class="divider flex justify-between text-sm font-extrabold text-[var(--text)] pt-2">
              <span>Estimated Total</span>
              <span>${{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Checkout actions -->
          <div class="grid grid-cols-2 gap-2 pt-1">
            <router-link
              to="/cart"
              @click="closeDrawer"
              class="py-2.5 px-3 rounded-sm border border-[var(--border-strong)] hover:border-[var(--text)] text-[var(--text)] font-bold text-xs text-center transition-colors"
            >
              View Full Bag
            </router-link>
            <router-link
              to="/checkout"
              @click="closeDrawer"
              class="py-2.5 px-3 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Checkout</span> <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'CartDrawer',
  setup() {
    const store = useStore();

    const isOpen = computed(() => store.getters['cart/isDrawerOpen']);
    const items = computed(() => store.getters['cart/cartItems']);
    const totalCount = computed(() => store.getters['cart/totalItemsCount']);
    const subtotal = computed(() => store.getters['cart/subtotal']);
    const discountAmount = computed(() => store.getters['cart/discountAmount']);
    const totalAmount = computed(() => store.getters['cart/totalAmount']);

    const closeDrawer = () => {
      store.dispatch('cart/toggleCartDrawer', false);
    };

    const updateQty = (item, qty) => {
      store.dispatch('cart/updateQuantity', {
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: qty
      });
    };

    const removeItem = (item) => {
      store.dispatch('cart/removeItem', {
        productId: item.productId,
        size: item.size,
        color: item.color
      });
    };

    return {
      isOpen,
      items,
      totalCount,
      subtotal,
      discountAmount,
      totalAmount,
      closeDrawer,
      updateQty,
      removeItem
    };
  }
};
</script>
