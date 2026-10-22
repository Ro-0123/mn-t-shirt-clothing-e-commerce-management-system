<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

    <!-- Status Banner -->
    <div class="border border-[var(--border)] p-8 text-center space-y-3 rounded-sm">
      <div
        class="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl"
        :class="isPendingKhqr ? 'bg-[var(--bg-alt)] border border-[var(--border-strong)] text-[var(--text)]' : 'bg-[var(--accent-soft)] border border-[var(--accent)]/40 text-[var(--accent)]'"
      >
        <i :class="isPendingKhqr ? 'fa-solid fa-clock' : 'fa-solid fa-check'"></i>
      </div>
      <h1 class="font-display text-3xl sm:text-4xl text-[var(--text)]">
        {{ isPendingKhqr ? 'Order Received — Awaiting Payment' : 'Order Confirmed!' }}
      </h1>
      <p class="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
        <template v-if="isPendingKhqr">
          Your order is reserved. Scan the KHQR code below to pay &mdash; your garments ship to our Phnom Penh packaging team as soon as payment is confirmed.
        </template>
        <template v-else>
          Thank you for choosing MN T-Shirt Clothing. Your garment order has been received and sent to our Phnom Penh packaging team.
        </template>
      </p>
      <div class="pt-2 flex items-center justify-center gap-3">
        <span class="px-3 py-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text)]">
          Order ID: {{ order?.id || $route.params.id }}
        </span>
      </div>
    </div>

    <!-- Printable Invoice Section -->
    <div id="printable-section" class="border border-[var(--border)] p-6 sm:p-10 space-y-8 rounded-sm">

      <!-- Invoice Header -->
      <div class="divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
        <div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-[var(--text)] text-white flex items-center justify-center font-display text-sm">
              MN
            </div>
            <span class="font-display text-base text-[var(--text)]">MN T-Shirt Clothing Co.</span>
          </div>
          <p class="text-xs text-[var(--text-faint)] mt-1">Official Garment Receipt</p>
        </div>

        <div class="text-left sm:text-right text-xs">
          <p class="font-bold text-[var(--text)]">Invoice: <span class="font-mono text-[var(--accent)]">{{ order?.id }}</span></p>
          <p class="text-[var(--text-faint)]">Date: {{ formatDate(order?.createdAt) }}</p>
          <span
            class="inline-block mt-1 px-2 py-0.5 rounded-sm text-[10px] font-bold border"
            :class="order?.paymentStatus === 'Pending' ? 'border-[var(--border-strong)] text-[var(--text-muted)]' : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'"
          >
            Payment: {{ order?.paymentStatus || 'Pending' }} ({{ order?.paymentMethod }})
          </span>
        </div>
      </div>

      <!-- KHQR Payment Pending -->
      <div v-if="isPendingKhqr" class="p-4 sm:p-5 border border-[var(--border)] flex flex-col sm:flex-row items-center gap-4 text-xs rounded-sm">
        <div class="w-14 h-14 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm flex items-center justify-center flex-shrink-0 text-[var(--accent)] text-xl">
          <i class="fa-solid fa-qrcode"></i>
        </div>
        <div class="space-y-1 text-center sm:text-left flex-1">
          <span class="px-2 py-0.5 rounded-sm border border-[var(--border-strong)] text-[var(--text)] font-bold text-[10px]">Awaiting Payment</span>
          <h4 class="font-bold text-sm text-[var(--text)]">Pay ${{ order?.total?.toFixed(2) }} via KHQR</h4>
          <p class="text-[11px] text-[var(--text-muted)]">
            Your order ships once payment is confirmed.
          </p>
        </div>
        <button
          @click="showKhqrModal = true"
          class="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs rounded-sm transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          <i class="fa-solid fa-qrcode mr-1.5"></i> View QR to Pay
        </button>
      </div>

      <!-- Shipping & Dispatch Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
        <div class="p-4 bg-[var(--bg-alt)] border border-[var(--border)] space-y-1 rounded-sm">
          <p class="font-bold uppercase tracking-wider text-[var(--text-faint)] text-[10px]">Customer Recipient</p>
          <p class="font-bold text-[var(--text)] text-sm">{{ order?.customerName }}</p>
          <p class="text-[var(--text-muted)]">{{ order?.customerPhone }}</p>
          <p class="text-[var(--text-muted)]">{{ order?.shippingAddress?.street }}, {{ order?.shippingAddress?.city }}</p>
        </div>

        <div class="p-4 bg-[var(--bg-alt)] border border-[var(--border)] space-y-1 rounded-sm">
          <p class="font-bold uppercase tracking-wider text-[var(--text-faint)] text-[10px]">Dispatch & Tracking</p>
          <p class="font-bold text-[var(--text)]">Carrier: {{ order?.carrier || 'MN Express Dispatch' }}</p>
          <p class="font-mono text-[var(--accent)] font-bold">Tracking #: {{ order?.trackingNumber || 'Pending' }}</p>
          <p class="text-[var(--text-muted)]">Est. Arrival: {{ order?.estimatedDelivery }}</p>
        </div>
      </div>

      <!-- Items Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-[var(--border)] text-[var(--text-faint)] font-bold uppercase tracking-wider text-[10px] bg-[var(--bg-alt)]">
              <th class="py-2.5 px-3">Item Description</th>
              <th class="py-2.5 px-3">Size / Color</th>
              <th class="py-2.5 px-3 text-center">Qty</th>
              <th class="py-2.5 px-3 text-right">Price</th>
              <th class="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="(item, idx) in order?.items" :key="idx" class="hover:bg-[var(--bg-alt)]">
              <td class="py-3 px-3">
                <div class="flex items-center gap-3">
                  <img :src="item.image" class="w-10 h-10 rounded-sm object-cover bg-[var(--bg-alt)] border border-[var(--border)]" />
                  <span class="font-bold text-[var(--text)]">{{ item.name }}</span>
                </div>
              </td>
              <td class="py-3 px-3 text-[var(--text-muted)]">
                Size {{ item.size }} &middot; {{ item.color }}
              </td>
              <td class="py-3 px-3 text-center font-bold text-[var(--text)]">{{ item.quantity }}</td>
              <td class="py-3 px-3 text-right text-[var(--text-muted)]">${{ item.price.toFixed(2) }}</td>
              <td class="py-3 px-3 text-right font-bold text-[var(--text)]">${{ (item.price * item.quantity).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals Breakdown -->
      <div class="divider flex justify-end pt-4 text-xs">
        <div class="w-64 space-y-2">
          <div class="flex justify-between text-[var(--text-muted)]">
            <span>Subtotal</span>
            <span class="font-bold text-[var(--text)]">${{ (order?.subtotal || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-[var(--text-muted)]">
            <span>Courier Shipping</span>
            <span class="font-bold text-[var(--text)]">
              {{ order?.shippingFee === 0 ? 'FREE' : `$${(order?.shippingFee || 0).toFixed(2)}` }}
            </span>
          </div>
          <div class="divider flex justify-between text-base font-black text-[var(--text)] pt-2">
            <span>Grand Total</span>
            <span>${{ (order?.total || 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="divider text-center pt-6 text-[11px] text-[var(--text-faint)]">
        <p>Thank you for supporting MN T-Shirt Clothing Cambodia! For customer support, contact support@mntshirt.com or +855 23 999 888.</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
      <router-link
        to="/orders"
        class="px-6 py-3 rounded-sm border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text)] font-bold text-xs transition-colors"
      >
        <i class="fa-solid fa-list-check mr-1.5 text-[var(--accent)]"></i> View All My Orders
      </router-link>

      <div class="flex items-center gap-3">
        <button
          @click="printInvoice"
          class="px-6 py-3 rounded-sm bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text)] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-[var(--border)]"
        >
          <i class="fa-solid fa-print"></i> Print Invoice
        </button>

        <router-link
          to="/shop"
          class="px-6 py-3 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs transition-colors flex items-center gap-2"
        >
          <span>Continue Shopping</span>
          <i class="fa-solid fa-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <!-- KHQR Payment Popup -->
    <Teleport to="body">
      <transition name="khqr-fade">
        <div
          v-if="isPendingKhqr && showKhqrModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          @click.self="showKhqrModal = false"
        >
          <transition name="khqr-scale" appear>
            <div class="storefront bg-[var(--surface)] w-full max-w-sm rounded-sm border border-[var(--border)] shadow-2xl overflow-hidden">
              <div class="flex items-center justify-between px-5 py-4 divider">
                <h3 class="font-display text-sm text-[var(--text)]">Scan to Pay</h3>
                <button
                  @click="showKhqrModal = false"
                  class="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--bg-alt)] text-[var(--text-muted)] cursor-pointer"
                  aria-label="Close"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="p-6 flex flex-col items-center text-center space-y-4">
                <template v-if="khqrExpired">
                  <div class="w-48 h-48 flex items-center justify-center text-[var(--text-faint)] text-5xl">
                    <i class="fa-solid fa-qrcode"></i>
                  </div>
                  <span class="px-2 py-0.5 rounded-sm bg-[var(--accent)] text-white font-bold text-[10px]">QR Expired</span>
                  <h4 class="font-bold text-sm text-[var(--text)]">This KHQR code has expired</h4>
                  <p class="text-[11px] text-[var(--text-muted)]">KHQR codes are only valid for 15 minutes. Get a fresh one to continue.</p>
                  <button
                    @click="refreshKhqr"
                    class="px-4 py-2.5 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
                  >
                    Get a new QR code
                  </button>
                </template>

                <template v-else>
                  <div class="w-48 h-48 bg-white border border-[var(--border)] p-2 rounded-sm flex items-center justify-center">
                    <img v-if="khqrImage" :src="khqrImage" alt="KHQR Code" class="w-full h-full object-contain" />
                    <div v-else class="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
                  </div>
                  <p class="font-display text-2xl text-[var(--text)]">${{ order?.total?.toFixed(2) }}</p>
                  <p class="text-[11px] text-[var(--text-muted)]">
                    Scan with ABA Mobile, Bakong, or any participating bank app.
                  </p>
                  <div class="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <span class="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                    Waiting for payment&hellip;
                  </div>
                  <p v-if="khqrCountdown" class="text-[10px] text-[var(--text-faint)] font-mono">
                    Expires in {{ khqrCountdown }}
                  </p>
                </template>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </Teleport>

  </div>
</template>


<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import QRCode from 'qrcode';
import { generateKhqrApi, checkKhqrPaymentApi } from '@/api';
import { SuccessToast } from '@/functions/sweetalert';

export default {
  name: 'OrderSuccess',
  setup() {
    const store = useStore();
    const route = useRoute();

    const order = computed(() => {
      const ordId = route.params.id;
      return store.getters['orders/allOrders'].find(o => o.id === ordId) || store.state.orders.currentOrder;
    });

    onMounted(() => {
      if (route.params.id) {
        store.dispatch('orders/fetchOrderById', route.params.id);
      }
    });

    const khqrImage = ref('');
    const khqrExpired = ref(false);
    const khqrExpiresAt = ref(null);
    const showKhqrModal = ref(false);
    const now = ref(Date.now());
    const isPendingKhqr = computed(() => order.value?.paymentMethod === 'ABA_QR' && order.value?.paymentStatus === 'Pending');

    const khqrCountdown = computed(() => {
      if (!khqrExpiresAt.value || khqrExpired.value) return '';
      const remainingMs = new Date(khqrExpiresAt.value).getTime() - now.value;
      if (remainingMs <= 0) return '';
      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    });

    let countdownTimer = null;

    const loadKhqr = async () => {
      if (!order.value) return;
      try {
        const res = await generateKhqrApi({ amount: order.value.total, billNumber: order.value.id });
        khqrImage.value = await QRCode.toDataURL(res.data.qr, { width: 220, margin: 1 });
        khqrExpiresAt.value = res.data.expiresAt;
        khqrExpired.value = false;
      } catch (err) {
        khqrImage.value = '';
      }
    };

    watch(order, (val) => {
      if (!val || val.paymentMethod !== 'ABA_QR' || val.paymentStatus !== 'Pending' || khqrImage.value) return;
      loadKhqr();
      showKhqrModal.value = true;
    }, { immediate: true });

    watch(khqrCountdown, (val) => {
      if (!val && khqrExpiresAt.value && !khqrExpired.value && Date.now() >= new Date(khqrExpiresAt.value).getTime()) {
        khqrExpired.value = true;
      }
    });

    const refreshKhqr = async () => {
      await loadKhqr();
      if (!pollTimer && isPendingKhqr.value) {
        pollTimer = setInterval(pollPaymentStatus, 4000);
      }
    };

    const formatDate = (d) => {
      if (!d) return 'Just now';
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const printInvoice = () => {
      window.print();
    };

    // Poll Bakong's Open API for payment confirmation while a KHQR order is pending
    let pollTimer = null;

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const pollPaymentStatus = async () => {
      if (!order.value?.id) return;
      try {
        const res = await checkKhqrPaymentApi(order.value.id);
        if (res.data.paid) {
          stopPolling();
          showKhqrModal.value = false;
          await store.dispatch('orders/fetchOrderById', order.value.id);
          SuccessToast('Payment Confirmed', 'Your KHQR payment has been received.');
        } else if (res.data.expired) {
          stopPolling();
          khqrExpired.value = true;
        }
      } catch (err) {
        // Silently retry on the next tick rather than surfacing transient network errors
      }
    };

    watch(isPendingKhqr, (pending) => {
      stopPolling();
      if (pending) {
        pollTimer = setInterval(pollPaymentStatus, 4000);
      }
    }, { immediate: true });

    countdownTimer = setInterval(() => { now.value = Date.now(); }, 1000);

    onUnmounted(() => {
      stopPolling();
      if (countdownTimer) clearInterval(countdownTimer);
    });

    return {
      order,
      formatDate,
      printInvoice,
      khqrImage,
      khqrExpired,
      khqrCountdown,
      showKhqrModal,
      refreshKhqr,
      isPendingKhqr
    };
  }
};
</script>

<style scoped>
.khqr-fade-enter-active,
.khqr-fade-leave-active {
  transition: opacity 0.2s ease;
}
.khqr-fade-enter-from,
.khqr-fade-leave-to {
  opacity: 0;
}

.khqr-scale-enter-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.khqr-scale-leave-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.khqr-scale-enter-from,
.khqr-scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
