<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <!-- Header -->
    <div class="divider pb-5">
      <h1 class="font-display text-3xl sm:text-4xl text-[var(--text)]">Express Checkout</h1>
      <p class="text-xs text-[var(--text-muted)] mt-1">Provide your delivery address and choose a payment method.</p>
    </div>

    <!-- Empty bag safeguard -->
    <div v-if="cartItems.length === 0" class="py-16 text-center border border-[var(--border)] p-8 space-y-3 rounded-sm">
      <p class="text-sm font-bold text-[var(--text)]">Your bag is empty.</p>
      <router-link to="/shop" class="inline-block px-5 py-2 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs">
        Return to Shop
      </router-link>
    </div>

    <form v-else @submit.prevent="handlePlaceOrder" class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Column: Shipping & Payment -->
      <div class="lg:col-span-7 space-y-6">

        <!-- Step 1: Contact & Delivery Address -->
        <div class="border border-[var(--border)] p-6 space-y-4 rounded-sm">
          <div class="flex items-center gap-2.5 text-sm font-bold text-[var(--text)] border-b border-[var(--border)] pb-3">
            <span class="w-6 h-6 bg-[var(--text)] text-white text-xs flex items-center justify-center font-bold rounded-sm">1</span>
            <h3>Delivery & Contact Information</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Full Name *</label>
              <input
                type="text"
                v-model="form.name"
                required
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-medium"
                placeholder="e.g. Chea Rithy"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Phone Number *</label>
              <input
                type="tel"
                v-model="form.phone"
                required
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-medium"
                placeholder="e.g. +855 12 345 678"
              />
            </div>

            <div class="sm:col-span-2 space-y-1">
              <label class="font-bold text-[var(--text)]">Email Address *</label>
              <input
                type="email"
                v-model="form.email"
                required
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-medium"
                placeholder="e.g. customer@example.com"
              />
            </div>

            <div class="sm:col-span-2 space-y-1">
              <label class="font-bold text-[var(--text)]">Street Address & House / Condo No. *</label>
              <input
                type="text"
                v-model="form.street"
                required
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-medium"
                placeholder="e.g. No. 45, Street 271, Sangkat Toul Tompoung"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">City / Province *</label>
              <select
                v-model="form.city"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium"
              >
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Siem Reap">Siem Reap</option>
                <option value="Battambang">Battambang</option>
                <option value="Preah Sihanouk">Preah Sihanouk (Kompong Som)</option>
                <option value="Kampot">Kampot</option>
                <option value="Kandal">Kandal</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Postal / Zip Code</label>
              <input
                type="text"
                v-model="form.zipCode"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-medium"
                placeholder="12000"
              />
            </div>

            <div class="sm:col-span-2 space-y-1">
              <label class="font-bold text-[var(--text)]">Delivery Instructions / Gate Notes (Optional)</label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-medium"
                placeholder="e.g. Leave with security guard or call upon arrival"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Step 2: Delivery Method Selection -->
        <div class="border border-[var(--border)] p-6 space-y-4 rounded-sm">
          <div class="flex items-center gap-2.5 text-sm font-bold text-[var(--text)] border-b border-[var(--border)] pb-3">
            <span class="w-6 h-6 bg-[var(--text)] text-white text-xs flex items-center justify-center font-bold rounded-sm">2</span>
            <h3>Delivery Method</h3>
          </div>

          <div class="grid grid-cols-1 gap-3 text-xs">
            <label
              :class="courierName === 'MN Express Dispatch' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--bg-alt)]'"
              class="p-4 rounded-sm border flex items-center gap-3 cursor-pointer transition-all"
            >
              <input type="radio" v-model="courierName" value="MN Express Dispatch" class="accent-[var(--accent)]" @change="courierManuallySet = true" />
              <div class="flex-1">
                <p class="font-bold text-[var(--text)]">MN Express Dispatch</p>
                <p class="text-[11px] text-[var(--text-muted)] mt-0.5">Phnom Penh intra-city, 3-hour expedited delivery</p>
              </div>
            </label>

            <label
              :class="courierName === 'J&T Express Partner' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--bg-alt)]'"
              class="p-4 rounded-sm border flex items-center gap-3 cursor-pointer transition-all"
            >
              <input type="radio" v-model="courierName" value="J&T Express Partner" class="accent-[var(--accent)]" @change="courierManuallySet = true" />
              <div class="flex-1">
                <p class="font-bold text-[var(--text)]">J&T Express Partner</p>
                <p class="text-[11px] text-[var(--text-muted)] mt-0.5">Provincial hub routing &mdash; 24h SLA (Siem Reap, Battambang, Sihanoukville)</p>
              </div>
            </label>

            <label
              :class="courierName === 'VET Express Dispatch' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--bg-alt)]'"
              class="p-4 rounded-sm border flex items-center gap-3 cursor-pointer transition-all"
            >
              <input type="radio" v-model="courierName" value="VET Express Dispatch" class="accent-[var(--accent)]" @change="courierManuallySet = true" />
              <div class="flex-1">
                <p class="font-bold text-[var(--text)]">VET Express Dispatch</p>
                <p class="text-[11px] text-[var(--text-muted)] mt-0.5">Regional bus & cargo transit &mdash; 48h SLA for remote provinces</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Step 3: Payment Method Selection -->
        <div class="border border-[var(--border)] p-6 space-y-4 rounded-sm">
          <div class="flex items-center gap-2.5 text-sm font-bold text-[var(--text)] border-b border-[var(--border)] pb-3">
            <span class="w-6 h-6 bg-[var(--text)] text-white text-xs flex items-center justify-center font-bold rounded-sm">3</span>
            <h3>Payment Method</h3>
          </div>

          <!-- Store credit is applied automatically before any gateway payment -->
          <div v-if="creditApplied > 0" class="p-4 border border-[var(--accent)] bg-[var(--accent-soft)] rounded-sm text-xs flex items-center gap-3 text-[var(--text-muted)]">
            <i class="fa-solid fa-wallet text-lg text-[var(--accent)] flex-shrink-0"></i>
            <p v-if="coveredByCredit">
              Your store credit covers this whole order. <span class="font-bold text-[var(--text)]">${{ creditApplied.toFixed(2) }}</span> will be taken from your
              <span class="font-bold text-[var(--text)]">${{ storeCredit.toFixed(2) }}</span> balance &mdash; no payment needed.
            </p>
            <p v-else>
              Your <span class="font-bold text-[var(--text)]">${{ creditApplied.toFixed(2) }}</span> store credit is applied.
              Choose how to pay the remaining <span class="font-bold text-[var(--text)]">${{ amountDue.toFixed(2) }}</span>.
            </p>
          </div>

          <div v-if="!coveredByCredit" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <!-- ABA PAY KHQR (Bakong) -->
            <label
              :class="paymentMethod === 'ABA_QR' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--bg-alt)]'"
              class="p-4 rounded-sm border flex items-center gap-3 cursor-pointer transition-all"
            >
              <input type="radio" v-model="paymentMethod" value="ABA_QR" class="accent-[var(--accent)]" />
              <div class="flex-1">
                <p class="font-bold text-[var(--text)]">ABA Pay / KHQR</p>
                <p class="text-[11px] text-[var(--text-muted)] mt-0.5">Scan via ABA Mobile, Bakong, or any bank</p>
              </div>
            </label>

            <!-- ABA PayWay QR -->
            <label
              :class="paymentMethod === 'PAYWAY_QR' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--bg-alt)]'"
              class="p-4 rounded-sm border flex items-center gap-3 cursor-pointer transition-all"
            >
              <input type="radio" v-model="paymentMethod" value="PAYWAY_QR" class="accent-[var(--accent)]" />
              <div class="flex-1">
                <p class="font-bold text-[var(--text)]">ABA PayWay QR</p>
                <p class="text-[11px] text-[var(--text-muted)] mt-0.5">Scan via ABA PayWay's own checkout</p>
              </div>
            </label>

            <!-- Credit / Debit Card via ABA PayWay -->
            <label
              :class="paymentMethod === 'PAYWAY_CARD' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--bg-alt)]'"
              class="p-4 rounded-sm border flex items-center gap-3 cursor-pointer transition-all"
            >
              <input type="radio" v-model="paymentMethod" value="PAYWAY_CARD" class="accent-[var(--accent)]" />
              <div class="flex-1">
                <p class="font-bold text-[var(--text)]">Credit / Debit Card</p>
                <p class="text-[11px] text-[var(--text-muted)] mt-0.5">Visa, MasterCard, JCB via ABA PayWay</p>
              </div>
            </label>


            <!-- PayPal (not yet wired up to a real gateway) -->
            <label
              class="p-4 rounded-sm border border-[var(--border)] flex items-center gap-3 opacity-50 cursor-not-allowed"
            >
              <input type="radio" value="PAYPAL" disabled class="accent-[var(--accent)]" />
              <div class="flex-1">
                <p class="font-bold text-[var(--text)]">PayPal</p>
                <p class="text-[11px] text-[var(--text-muted)] mt-0.5">Coming soon &mdash; not available yet</p>
              </div>
            </label>
          </div>

          <!-- Online payment note -- the QR/card flow itself only appears once Confirm & Place Order is clicked -->
          <div v-if="!coveredByCredit && (paymentMethod === 'ABA_QR' || paymentMethod === 'PAYWAY_QR')" class="p-4 border border-[var(--border)] rounded-sm text-xs flex items-center gap-3 text-[var(--text-muted)]">
            <i class="fa-solid fa-qrcode text-lg text-[var(--accent)] flex-shrink-0"></i>
            <p>You'll be shown a QR code to scan and pay <span class="font-bold text-[var(--text)]">${{ amountDue.toFixed(2) }}</span> when you click "Confirm & Place Order" below. Your order is only placed once that payment is confirmed.</p>
          </div>
          <div v-else-if="!coveredByCredit && paymentMethod === 'PAYWAY_CARD'" class="p-4 border border-[var(--border)] rounded-sm text-xs flex items-center gap-3 text-[var(--text-muted)]">
            <i class="fa-solid fa-credit-card text-lg text-[var(--accent)] flex-shrink-0"></i>
            <p>You'll confirm your card payment of <span class="font-bold text-[var(--text)]">${{ amountDue.toFixed(2) }}</span> when you click "Confirm & Place Order" below. Your order is only placed once that payment is confirmed.</p>
          </div>
        </div>

      </div>

      <!-- Right Column: Summary & Place Order CTA -->
      <div class="lg:col-span-5 space-y-6">
        <div class="border border-[var(--border)] p-6 space-y-5 sticky top-24 rounded-sm">
          <h3 class="font-display text-xl text-[var(--text)] border-b border-[var(--border)] pb-3">
            Review Garments ({{ totalCount }})
          </h3>

          <!-- Items Mini List -->
          <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="(item, idx) in cartItems"
              :key="idx"
              class="flex items-center gap-3 text-xs"
            >
              <img :src="item.image" class="w-12 h-12 rounded-sm object-cover bg-[var(--bg-alt)] border border-[var(--border)] flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-[var(--text)] truncate">{{ item.name }}</p>
                <p class="text-[11px] text-[var(--text-faint)]">Qty: {{ item.quantity }} &middot; Size: {{ item.size }} &middot; {{ item.color }}</p>
              </div>
              <span class="font-bold text-[var(--text)]">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Price Calculations -->
          <div class="space-y-2 text-xs border-t border-[var(--border)] pt-4">
            <div class="flex justify-between text-[var(--text-muted)]">
              <span>Subtotal</span>
              <span class="font-bold text-[var(--text)]">${{ subtotal.toFixed(2) }}</span>
            </div>

            <div v-if="discountAmount > 0" class="flex justify-between text-[var(--accent)] font-bold">
              <span>Discount</span>
              <span>-${{ discountAmount.toFixed(2) }}</span>
            </div>

            <div class="divider flex justify-between text-lg font-black text-[var(--text)] pt-3">
              <span>Order Total</span>
              <span>${{ totalAmount.toFixed(2) }}</span>
            </div>

            <template v-if="creditApplied > 0">
              <div class="flex justify-between text-[var(--accent)] font-bold">
                <span>Store Credit</span>
                <span>-${{ creditApplied.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-lg font-black text-[var(--text)]">
                <span>Amount to Pay</span>
                <span>${{ amountDue.toFixed(2) }}</span>
              </div>
            </template>
          </div>

          <!-- Submit Order Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-4 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white rounded-sm font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else>Confirm & Place Order</span>
            <i v-if="!isSubmitting" class="fa-solid fa-check"></i>
          </button>

          <p v-if="coveredByCredit" class="text-[11px] text-center text-[var(--text-muted)]">
            Paid in full with store credit &mdash; your order is placed right away.
          </p>
          <p v-else-if="paymentMethod === 'ABA_QR' || paymentMethod === 'PAYWAY_QR'" class="text-[11px] text-center text-[var(--text-muted)]">
            You'll scan a QR code to confirm payment before your order is placed.
          </p>
          <p v-else-if="paymentMethod === 'PAYWAY_CARD'" class="text-[11px] text-center text-[var(--text-muted)]">
            You'll confirm your card payment before your order is placed.
          </p>

          <p class="text-[11px] text-center text-[var(--text-faint)]">
            By placing an order, you agree to MN T-Shirt Clothing's 14-day return and exchange policy.
          </p>
        </div>
      </div>

    </form>

    <!-- Scan to Pay Popup -->
    <Teleport to="body">
      <transition name="khqr-fade">
        <div
          v-if="showPaymentModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          @click.self="closePaymentModal"
        >
          <transition name="khqr-scale" appear>
            <div class="storefront bg-[var(--surface)] w-full max-w-sm rounded-sm border border-[var(--border)] shadow-2xl overflow-hidden">
              <div class="flex items-center justify-between px-5 py-4 divider">
                <h3 class="font-display text-sm text-[var(--text)]">{{ cardRedirectUrl ? 'Confirm Payment' : 'Scan to Pay' }}</h3>
                <button
                  @click="closePaymentModal"
                  class="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--bg-alt)] text-[var(--text-muted)] cursor-pointer"
                  aria-label="Close"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="p-6 flex flex-col items-center text-center space-y-4">
                <template v-if="qrExpired">
                  <div class="w-48 h-48 flex items-center justify-center text-[var(--text-faint)] text-5xl">
                    <i class="fa-solid fa-qrcode"></i>
                  </div>
                  <span class="px-2 py-0.5 rounded-sm bg-[var(--accent)] text-white font-bold text-[10px]">QR Expired</span>
                  <h4 class="font-bold text-sm text-[var(--text)]">This QR code has expired</h4>
                  <p class="text-[11px] text-[var(--text-muted)]">Get a fresh one to continue.</p>
                  <button
                    @click="refreshPayment"
                    class="px-4 py-2.5 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
                  >
                    Get a new QR code
                  </button>
                </template>

                <!-- PayWay card flow may hand back a hosted redirect instead of a QR -->
                <template v-else-if="cardRedirectUrl">
                  <div class="w-16 h-16 flex items-center justify-center text-[var(--accent)] text-4xl">
                    <i class="fa-solid fa-credit-card"></i>
                  </div>
                  <h4 class="font-bold text-sm text-[var(--text)]">Continue to ABA PayWay</h4>
                  <p class="text-[11px] text-[var(--text-muted)]">
                    You'll be taken to ABA PayWay's secure page to enter your card details and pay ${{ totalAmount.toFixed(2) }}.
                  </p>
                  <a
                    :href="cardRedirectUrl"
                    class="px-4 py-2.5 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs rounded-sm transition-colors cursor-pointer inline-block"
                  >
                    Continue to Payment
                  </a>
                </template>

                <template v-else>
                  <div class="w-48 h-48 bg-white border border-[var(--border)] p-2 rounded-sm flex items-center justify-center">
                    <img v-if="qrImage" :src="qrImage" alt="Payment QR Code" class="w-full h-full object-contain" />
                    <div v-else class="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
                  </div>
                  <p class="font-display text-2xl text-[var(--text)]">${{ totalAmount.toFixed(2) }}</p>
                  <p class="text-[11px] text-[var(--text-muted)]">
                    Scan with ABA Mobile, Bakong, or any participating bank app. Your order is placed automatically once payment is confirmed.
                  </p>
                  <a v-if="qrDeepLink" :href="qrDeepLink" class="text-[11px] text-[var(--accent)] font-semibold underline">
                    Open in ABA Mobile
                  </a>
                  <div class="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <span class="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                    Waiting for payment&hellip;
                  </div>
                  <p v-if="qrCountdown" class="text-[10px] text-[var(--text-faint)] font-mono">
                    Expires in {{ qrCountdown }}
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import QRCode from 'qrcode';
import { generateKhqrApi, checkKhqrPaymentByMd5Api, generatePaywayPaymentApi, checkPaywayPaymentApi } from '@/api';
import { LoadingModal, CloseModal, ErrorToast } from '@/functions/sweetalert';

const ONLINE_PAYMENT_METHODS = ['ABA_QR', 'PAYWAY_QR', 'PAYWAY_CARD'];

export default {
  name: 'Checkout',
  setup() {
    const store = useStore();
    const router = useRouter();

    const isSubmitting = ref(false);
    const paymentMethod = ref('ABA_QR');
    const courierName = ref('MN Express Dispatch');
    const courierManuallySet = ref(false);

    const PROVINCIAL_HUBS = ['Siem Reap', 'Battambang', 'Preah Sihanouk'];

    const suggestCourier = (city) => {
      if (city === 'Phnom Penh') return 'MN Express Dispatch';
      if (PROVINCIAL_HUBS.includes(city)) return 'J&T Express Partner';
      return 'VET Express Dispatch';
    };

    const user = computed(() => store.getters['auth/currentUser']);
    const cartItems = computed(() => store.getters['cart/cartItems']);
    const totalCount = computed(() => store.getters['cart/totalItemsCount']);
    const subtotal = computed(() => store.getters['cart/subtotal']);
    const discountAmount = computed(() => store.getters['cart/discountAmount']);
    const totalAmount = computed(() => store.getters['cart/totalAmount']);
    const appliedPromo = computed(() => store.getters['cart/appliedPromo']);
    // Store credit is used automatically; only what's left goes to a payment gateway.
    // The backend recomputes all of this itself -- these are just for display.
    const storeCredit = computed(() => Number(user.value?.storeCredit || 0));
    const creditApplied = computed(() => Math.min(storeCredit.value, totalAmount.value));
    const amountDue = computed(() => Math.round((totalAmount.value - creditApplied.value) * 100) / 100);
    const coveredByCredit = computed(() => totalAmount.value > 0 && amountDue.value === 0);

    // qrImage/qrExpiresAt/qrExpired/isPaid are shared across all three online
    // payment methods (Bakong KHQR, PayWay QR, PayWay Card) -- only one is
    // ever active at a time, selected by paymentMethod.
    const qrImage = ref('');
    const qrDeepLink = ref(''); // "Open in ABA Mobile" link -- PayWay only
    const cardRedirectUrl = ref(''); // set if PayWay's card flow returns a hosted redirect instead of a QR
    const khqrMd5 = ref('');
    const paywayTranId = ref('');
    const qrExpiresAt = ref(null);
    const qrExpired = ref(false);
    const isPaid = ref(false);
    const showPaymentModal = ref(false);
    const now = ref(Date.now());

    const qrCountdown = computed(() => {
      if (!qrExpiresAt.value || qrExpired.value) return '';
      const remainingMs = new Date(qrExpiresAt.value).getTime() - now.value;
      if (remainingMs <= 0) return '';
      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    });

    let pollTimer = null;
    let countdownTimer = null;

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const pollPaymentStatus = async () => {
      if (isPaid.value) return;
      if (qrExpiresAt.value && Date.now() > new Date(qrExpiresAt.value).getTime()) {
        stopPolling();
        qrExpired.value = true;
        return;
      }
      try {
        let paid = false;
        if (paymentMethod.value === 'ABA_QR') {
          if (!khqrMd5.value) return;
          const res = await checkKhqrPaymentByMd5Api(khqrMd5.value);
          paid = res.data.paid;
        } else if (paymentMethod.value === 'PAYWAY_QR' || paymentMethod.value === 'PAYWAY_CARD') {
          if (!paywayTranId.value) return;
          const res = await checkPaywayPaymentApi(paywayTranId.value);
          paid = res.data.paid;
        }
        if (paid) {
          stopPolling();
          isPaid.value = true;
          await submitOrder();
        }
      } catch (err) {
        // silently retry on the next tick
      }
    };

    const loadKhqrPreview = async () => {
      if (amountDue.value <= 0) return;
      stopPolling();
      qrExpired.value = false;
      isPaid.value = false;
      cardRedirectUrl.value = '';
      qrDeepLink.value = '';
      try {
        const res = await generateKhqrApi({ amount: amountDue.value, billNumber: 'PREVIEW' });
        qrImage.value = await QRCode.toDataURL(res.data.qr, { width: 240, margin: 1 });
        khqrMd5.value = res.data.md5;
        qrExpiresAt.value = res.data.expiresAt;
        pollTimer = setInterval(pollPaymentStatus, 4000);
      } catch (err) {
        qrImage.value = '';
        ErrorToast('KHQR Error', err.parsedMessage || 'Could not generate a KHQR code');
        showPaymentModal.value = false;
      }
    };

    // ABA PayWay (https://www.payway.com.kh) -- `paymentOption` is '' for a
    // QR + ABA Mobile deep link, or 'cards' for direct card entry. Which
    // exact shape 'cards' responds with (QR vs. a hosted redirect) isn't
    // confirmed yet without real sandbox credentials -- both are handled
    // defensively below. See backend/utils/payway.js for the signing details.
    const loadPaywayPreview = async (paymentOption) => {
      if (amountDue.value <= 0) return;
      stopPolling();
      qrExpired.value = false;
      isPaid.value = false;
      qrImage.value = '';
      qrDeepLink.value = '';
      cardRedirectUrl.value = '';
      try {
        const res = await generatePaywayPaymentApi({ amount: amountDue.value, paymentOption });
        if (res.data.status?.code && res.data.status.code !== '00') {
          throw new Error(res.data.status.message || 'ABA PayWay request failed');
        }

        paywayTranId.value = res.data.tran_id;
        // PayWay doesn't echo an expiry timestamp back -- approximate it
        // client-side from the 30-minute lifetime we requested.
        qrExpiresAt.value = new Date(Date.now() + 30 * 60 * 1000);

        if (res.data.qrImage) {
          qrImage.value = res.data.qrImage;
          qrDeepLink.value = res.data.abapay_deeplink || '';
        } else if (res.data.checkout_url || res.data.payment_url) {
          cardRedirectUrl.value = res.data.checkout_url || res.data.payment_url;
        } else {
          throw new Error('Unexpected response from ABA PayWay');
        }

        pollTimer = setInterval(pollPaymentStatus, 4000);
      } catch (err) {
        ErrorToast('ABA PayWay Error', err.parsedMessage || err.message || 'Could not start ABA PayWay payment');
        showPaymentModal.value = false;
      }
    };

    // Changing payment method or the amount due invalidates any in-flight QR --
    // a fresh one is only generated once the user actually clicks Confirm & Place Order.
    watch([paymentMethod, amountDue], () => {
      stopPolling();
      qrImage.value = '';
      qrDeepLink.value = '';
      cardRedirectUrl.value = '';
      khqrMd5.value = '';
      paywayTranId.value = '';
      isPaid.value = false;
      qrExpired.value = false;
      showPaymentModal.value = false;
    });

    onMounted(() => {
      countdownTimer = setInterval(() => { now.value = Date.now(); }, 1000);
    });

    onUnmounted(() => {
      stopPolling();
      if (countdownTimer) clearInterval(countdownTimer);
    });

    const form = ref({
      name: user.value?.name || 'Chea Rithy',
      phone: user.value?.phone || '+855 92 111 222',
      email: user.value?.email || 'customer@mntshirt.com',
      street: user.value?.address || 'Street 271, Sangkat Toul Tompoung',
      city: 'Phnom Penh',
      zipCode: '12310',
      notes: ''
    });

    courierName.value = suggestCourier(form.value.city);

    watch(() => form.value.city, (city) => {
      if (!courierManuallySet.value) {
        courierName.value = suggestCourier(city);
      }
    });

    const submitOrder = async () => {
      if (cartItems.value.length === 0 || isSubmitting.value) return;

      isSubmitting.value = true;
      LoadingModal('Securing Order...', 'Submitting to MN fulfillment and generating invoice');

      try {
        const orderPayload = {
          customerName: form.value.name,
          customerEmail: form.value.email,
          customerPhone: form.value.phone,
          shippingAddress: {
            street: form.value.street,
            city: form.value.city,
            country: 'Cambodia',
            zipCode: form.value.zipCode
          },
          items: cartItems.value,
          paymentMethod: coveredByCredit.value ? 'STORE_CREDIT' : paymentMethod.value,
          khqrMd5: paymentMethod.value === 'ABA_QR' ? khqrMd5.value : undefined,
          paywayTranId: (paymentMethod.value === 'PAYWAY_QR' || paymentMethod.value === 'PAYWAY_CARD') ? paywayTranId.value : undefined,
          courierName: courierName.value,
          discountCode: appliedPromo.value,
          notes: form.value.notes
        };

        const newOrder = await store.dispatch('orders/placeOrder', orderPayload);
        CloseModal();
        showPaymentModal.value = false;
        router.push(`/order-success/${newOrder.id}`);
      } catch (err) {
        CloseModal();
        // If payment verification failed server-side, let them keep trying to pay.
        isPaid.value = false;
      } finally {
        isSubmitting.value = false;
      }
    };

    const handlePlaceOrder = async () => {
      if (cartItems.value.length === 0) return;

      // Store credit covers everything -- nothing to pay, place the order now
      if (coveredByCredit.value) {
        submitOrder();
        return;
      }

      // Online payment methods: the QR/card flow only comes out now, in
      // response to this click -- then we check whether it gets paid before
      // the order is ever created.
      if (!isPaid.value && ONLINE_PAYMENT_METHODS.includes(paymentMethod.value)) {
        showPaymentModal.value = true;
        if (paymentMethod.value === 'ABA_QR') await loadKhqrPreview();
        else if (paymentMethod.value === 'PAYWAY_QR') await loadPaywayPreview('');
        else if (paymentMethod.value === 'PAYWAY_CARD') await loadPaywayPreview('cards');
        return;
      }

      submitOrder();
    };

    const closePaymentModal = () => {
      showPaymentModal.value = false;
      stopPolling();
    };

    const refreshPayment = () => {
      if (paymentMethod.value === 'ABA_QR') loadKhqrPreview();
      else if (paymentMethod.value === 'PAYWAY_QR') loadPaywayPreview('');
      else if (paymentMethod.value === 'PAYWAY_CARD') loadPaywayPreview('cards');
    };

    return {
      form,
      paymentMethod,
      courierName,
      courierManuallySet,
      isSubmitting,
      cartItems,
      totalCount,
      subtotal,
      discountAmount,
      totalAmount,
      storeCredit,
      creditApplied,
      amountDue,
      coveredByCredit,
      qrImage,
      qrDeepLink,
      cardRedirectUrl,
      qrExpired,
      qrCountdown,
      isPaid,
      showPaymentModal,
      refreshPayment,
      closePaymentModal,
      handlePlaceOrder
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
