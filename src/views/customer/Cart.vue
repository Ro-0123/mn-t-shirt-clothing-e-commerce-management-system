<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <div class="divider flex items-center justify-between pb-5">
      <div>
        <h1 class="font-display text-3xl sm:text-4xl text-[var(--text)]">Shopping Bag</h1>
        <p class="text-xs text-[var(--text-muted)] mt-1">Review your garments, apply discounts, and proceed to checkout.</p>
      </div>

      <router-link to="/shop" class="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1">
        <i class="fa-solid fa-arrow-left"></i> <span>Continue shopping</span>
      </router-link>
    </div>

    <!-- Empty Bag State -->
    <div v-if="cartItems.length === 0" class="py-24 text-center border border-[var(--border)] p-8 space-y-4 rounded-sm">
      <div class="w-20 h-20 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-faint)] mx-auto flex items-center justify-center text-3xl">
        <i class="fa-solid fa-bag-shopping"></i>
      </div>
      <h3 class="text-lg font-bold text-[var(--text)]">Your bag is currently empty</h3>
      <p class="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
        Looks like you haven't added any MN heavy cotton tees or streetwear to your bag yet.
      </p>
      <router-link
        to="/shop"
        class="inline-block mt-2 px-6 py-3 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs transition-colors"
      >
        Browse t-shirt catalog
      </router-link>
    </div>

    <!-- Filled Bag Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Items List Table -->
      <div class="lg:col-span-8 space-y-4">

        <div class="border border-[var(--border)] overflow-hidden rounded-sm">
          <div class="p-4 border-b border-[var(--border)] surface-alt flex items-center justify-between text-xs font-bold text-[var(--text)]">
            <span>{{ totalCount }} garments in bag</span>
            <button
              @click="clearAll"
              class="text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <i class="fa-regular fa-trash-can"></i> Clear bag
            </button>
          </div>

          <div class="divide-y divide-[var(--border)]">
            <div
              v-for="(item, idx) in cartItems"
              :key="`${item.productId}-${item.size}-${item.color}-${idx}`"
              class="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-20 h-20 sm:w-24 sm:h-24 object-cover bg-[var(--bg-alt)] border border-[var(--border)] flex-shrink-0 rounded-sm"
              />

              <div class="flex-1 min-w-0 space-y-1">
                <router-link :to="`/product/${item.productId}`">
                  <h3 class="font-bold text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                    {{ item.name }}
                  </h3>
                </router-link>

                <div class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span class="px-2 py-0.5 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)] font-medium">Size: {{ item.size }}</span>
                  <span class="px-2 py-0.5 rounded-sm bg-[var(--bg-alt)] border border-[var(--border)] font-medium">Color: {{ item.color }}</span>
                </div>

                <p class="text-xs font-semibold text-[var(--text-muted)] sm:hidden mt-2">
                  ${{ item.price.toFixed(2) }} each
                </p>
              </div>

              <!-- Price & Quantity -->
              <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div class="flex items-center border border-[var(--border)] rounded-sm overflow-hidden">
                  <button
                    @click="updateQuantity(item, item.quantity - 1)"
                    class="px-2.5 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span class="px-3 font-bold text-xs text-[var(--text)]">{{ item.quantity }}</span>
                  <button
                    @click="updateQuantity(item, item.quantity + 1)"
                    class="px-2.5 py-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-alt)] transition-colors text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div class="text-right min-w-[70px]">
                  <p class="font-extrabold text-sm text-[var(--text)]">
                    ${{ (item.price * item.quantity).toFixed(2) }}
                  </p>
                </div>

                <button
                  @click="removeItem(item)"
                  class="p-2 text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  title="Remove from bag"
                >
                  <i class="fa-regular fa-trash-can text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Free shipping incentive banner -->
        <div class="border border-[var(--border)] p-4 flex items-center gap-3 rounded-sm">
          <div class="w-10 h-10 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center text-base">
            <i class="fa-solid fa-truck-fast"></i>
          </div>
          <div>
            <p class="font-bold text-xs text-[var(--text)]">Free nationwide shipping</p>
            <p class="text-[11px] text-[var(--text-muted)]">Complimentary courier to all Cambodian provinces.</p>
          </div>
        </div>

      </div>

      <!-- Order Summary Card -->
      <div class="lg:col-span-4 space-y-6">
        <div class="border border-[var(--border)] p-6 space-y-5 rounded-sm">
          <h2 class="font-display text-xl text-[var(--text)] border-b border-[var(--border)] pb-3">
            Order Summary
          </h2>

          <!-- Breakdown Calculations -->
          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between text-[var(--text-muted)]">
              <span>Subtotal</span>
              <span class="font-bold text-[var(--text)]">${{ subtotal.toFixed(2) }}</span>
            </div>

            <div class="divider flex justify-between text-base font-black text-[var(--text)] pt-3">
              <span>Total</span>
              <span>${{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Checkout CTA -->
          <router-link
            to="/checkout"
            class="w-full py-3.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to checkout</span>
            <i class="fa-solid fa-arrow-right"></i>
          </router-link>

          <div class="pt-2 text-center">
            <span class="text-[11px] text-[var(--text-faint)]"><i class="fa-solid fa-lock mr-1"></i>256-bit encrypted checkout</span>
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
  name: 'Cart',
  setup() {
    const store = useStore();

    const cartItems = computed(() => store.getters['cart/cartItems']);
    const totalCount = computed(() => store.getters['cart/totalItemsCount']);
    const subtotal = computed(() => store.getters['cart/subtotal']);
    const totalAmount = computed(() => store.getters['cart/totalAmount']);

    const updateQuantity = (item, qty) => {
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

    const clearAll = () => {
      store.dispatch('cart/clearCart');
    };

    return {
      cartItems,
      totalCount,
      subtotal,
      totalAmount,
      updateQuantity,
      removeItem,
      clearAll
    };
  }
};
</script>
