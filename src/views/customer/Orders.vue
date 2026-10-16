<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <div class="divider flex items-center justify-between pb-5">
      <div>
        <h1 class="font-display text-3xl sm:text-4xl text-[var(--text)]">My Order History</h1>
        <p class="text-xs text-[var(--text-muted)] mt-1">Track status, view delivery stages, and print receipts.</p>
      </div>

      <router-link to="/shop" class="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs transition-colors">
        <i class="fa-solid fa-bag-shopping mr-1"></i> Shop New Tees
      </router-link>
    </div>

    <!-- Orders List -->
    <div v-if="orders.length === 0" class="py-20 text-center border border-[var(--border)] p-8 space-y-3 rounded-sm">
      <div class="w-16 h-16 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-faint)] mx-auto flex items-center justify-center text-2xl">
        <i class="fa-solid fa-receipt"></i>
      </div>
      <h3 class="font-bold text-[var(--text)] text-base">No orders placed yet</h3>
      <p class="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
        When you purchase MN t-shirts, they will appear here with live tracking updates.
      </p>
      <router-link to="/shop" class="inline-block mt-2 px-5 py-2.5 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs">
        Browse Collection
      </router-link>
    </div>

    <div v-else class="space-y-5">
      <div
        v-for="order in orders"
        :key="order.id"
        class="border border-[var(--border)] hover:border-[var(--border-strong)] p-6 space-y-5 transition-all rounded-sm"
      >
        <!-- Header -->
        <div class="divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <span class="font-mono font-extrabold text-sm text-[var(--text)]">{{ order.id }}</span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                :class="getStatusBadgeClass(order.orderStatus)"
              >
                {{ order.orderStatus }}
              </span>
            </div>
            <p class="text-xs text-[var(--text-faint)]">Placed on {{ formatDate(order.createdAt) }}</p>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span class="text-base font-black text-[var(--text)]">${{ order.total.toFixed(2) }}</span>
            <button
              v-if="order.orderStatus === 'Pending'"
              @click="handleCancelOrder(order.id)"
              :disabled="cancellingOrderId === order.id"
              class="px-3 py-1.5 rounded-sm bg-[var(--bg-alt)] hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span v-if="cancellingOrderId === order.id" class="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></span>
              <i v-else class="fa-solid fa-xmark"></i>
              {{ cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order' }}
            </button>
            <router-link
              :to="`/order-success/${order.id}`"
              class="px-3 py-1.5 rounded-sm bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text)] border border-[var(--border)] font-semibold text-xs transition-colors"
            >
              <i class="fa-solid fa-receipt mr-1 text-[var(--accent)]"></i> Invoice
            </router-link>
          </div>
        </div>

        <!-- Tracking Stepper Mini -->
        <div class="p-4 bg-[var(--bg-alt)] border border-[var(--border)] space-y-3 rounded-sm">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-[var(--text-muted)]">
              <i class="fa-solid fa-truck-fast text-[var(--text-faint)] mr-1.5"></i> Courier: {{ order.carrier }}
            </span>
            <span class="font-mono text-[var(--text-faint)] font-semibold">Tracking #: {{ order.trackingNumber }}</span>
          </div>

          <!-- Progress bar -->
          <div class="grid grid-cols-4 gap-2 text-center text-[10px] font-bold pt-1">
            <div :class="getStepColor(order.orderStatus, 1)">
              <div class="h-1.5 rounded-full bg-current mb-1"></div>
              <span>Pending</span>
            </div>
            <div :class="getStepColor(order.orderStatus, 2)">
              <div class="h-1.5 rounded-full bg-current mb-1"></div>
              <span>Processing</span>
            </div>
            <div :class="getStepColor(order.orderStatus, 3)">
              <div class="h-1.5 rounded-full bg-current mb-1"></div>
              <span>Shipped</span>
            </div>
            <div :class="getStepColor(order.orderStatus, 4)">
              <div class="h-1.5 rounded-full bg-current mb-1"></div>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        <!-- Items inside Order -->
        <div class="divide-y divide-[var(--border)]">
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="py-3 flex items-center gap-4 text-xs"
          >
            <img :src="item.image" class="w-14 h-14 rounded-sm object-cover bg-[var(--bg-alt)] border border-[var(--border)] flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-[var(--text)] truncate">{{ item.name }}</h4>
              <p class="text-[var(--text-faint)] text-[11px]">Size {{ item.size }} &middot; {{ item.color }} &middot; Qty: {{ item.quantity }}</p>
            </div>
            <span class="font-bold text-[var(--text)]">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Address -->
        <div class="divider pt-3 text-xs text-[var(--text-muted)]">
          <span class="font-semibold text-[var(--text)]">Delivery Address:</span> {{ order.shippingAddress.street }}, {{ order.shippingAddress.city }}
        </div>

        <!-- Cancellation reason -->
        <div v-if="order.orderStatus === 'Cancelled' && order.cancelReason" class="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-700">
          <span class="font-semibold">Cancellation reason:</span> {{ order.cancelReason }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ConfirmWithReason } from '@/functions/sweetalert';

export default {
  name: 'Orders',
  setup() {
    const store = useStore();

    const orders = computed(() => store.getters['orders/allOrders']);
    const cancellingOrderId = ref(null);

    onMounted(() => {
      store.dispatch('orders/fetchOrders');
    });

    const handleCancelOrder = async (orderId) => {
      const cancelReason = await ConfirmWithReason({
        title: `Cancel order ${orderId}?`,
        text: 'Your items will be released back into stock, and if you already paid, the order total will be added to your store credit. This action cannot be undone.',
        inputLabel: 'Reason for cancelling',
        inputPlaceholder: 'e.g. Ordered by mistake, found a better price, no longer needed...',
        confirmButtonText: 'Yes, Cancel Order',
        confirmButtonColor: '#d7263d'
      });
      if (!cancelReason) return;

      cancellingOrderId.value = orderId;
      try {
        await store.dispatch('orders/cancelOrder', { orderId, cancelReason });
      } catch (error) {
        // error toast already shown by the store action
      } finally {
        cancellingOrderId.value = null;
      }
    };

    const formatDate = (d) => {
      if (!d) return '';
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Delivered': return 'bg-[var(--text)] text-white';
        case 'Shipped': return 'bg-[var(--accent)] text-white';
        case 'Processing': return 'border border-[var(--border-strong)] text-[var(--text)]';
        case 'Cancelled': return 'border border-[var(--accent)] text-[var(--accent)]';
        default: return 'bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-muted)]';
      }
    };

    const getStepColor = (status, step) => {
      const levels = { 'Pending': 1, 'Processing': 2, 'Shipped': 3, 'Delivered': 4 };
      const currentLevel = levels[status] || 1;
      return currentLevel >= step ? 'text-[var(--accent)]' : 'text-[var(--border)]';
    };

    return {
      orders,
      cancellingOrderId,
      formatDate,
      getStatusBadgeClass,
      getStepColor,
      handleCancelOrder
    };
  }
};
</script>
