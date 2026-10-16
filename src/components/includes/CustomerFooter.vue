<template>
  <footer class="surface-alt border-t border-[var(--border)] pt-16 pb-8 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--border)]">

        <!-- Column 1: Brand -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 bg-[var(--text)] text-white flex items-center justify-center font-display text-base">
              MN
            </div>
            <div>
              <span class="font-display text-base text-[var(--text)] block leading-none">MN T-Shirt</span>
              <span class="text-[10px] tracking-widest uppercase font-bold text-[var(--text-muted)] block mt-0.5">Clothing Co.</span>
            </div>
          </div>
          <p class="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
            Heavyweight streetwear and essential cotton basics, screen-printed and stitched in Phnom Penh, Cambodia. 280+ GSM organic combed cotton, run in small batches.
          </p>
          <div class="flex items-center gap-2 pt-2">
            <a href="#" class="w-8 h-8 bg-white hover:bg-[var(--text)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] flex items-center justify-center text-xs transition-colors rounded-sm">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" class="w-8 h-8 bg-white hover:bg-[var(--text)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] flex items-center justify-center text-xs transition-colors rounded-sm">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="#" class="w-8 h-8 bg-white hover:bg-[var(--text)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] flex items-center justify-center text-xs transition-colors rounded-sm">
              <i class="fa-brands fa-telegram"></i>
            </a>
            <a href="#" class="w-8 h-8 bg-white hover:bg-[var(--text)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] flex items-center justify-center text-xs transition-colors rounded-sm">
              <i class="fa-brands fa-tiktok"></i>
            </a>
          </div>
        </div>

        <!-- Column 2: Collections -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-4">Collections</h4>
          <ul class="space-y-2.5 text-xs text-[var(--text-muted)]">
            <li><router-link to="/shop?category=essential-t-shirts" class="hover:text-[var(--text)] transition-colors">Essential T-Shirts</router-link></li>
            <li><router-link to="/shop?category=oversized-streetwear" class="hover:text-[var(--text)] transition-colors">Oversized Boxy Tees</router-link></li>
            <li><router-link to="/shop?category=graphic-anime-tees" class="hover:text-[var(--text)] transition-colors">Graphic Screenprints</router-link></li>
            <li><router-link to="/shop?category=vintage-washed" class="hover:text-[var(--text)] transition-colors">Vintage Acid Washed</router-link></li>
            <li><router-link to="/shop?category=polo-smart-casual" class="hover:text-[var(--text)] transition-colors">Structured Polos</router-link></li>
            <li><router-link to="/shop?category=hoodies-longsleeves" class="hover:text-[var(--text)] transition-colors">Heavy Fleece Hoodies</router-link></li>
          </ul>
        </div>

        <!-- Column 3: Customer Care -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-4">Customer Care</h4>
          <ul class="space-y-2.5 text-xs text-[var(--text-muted)]">
            <li><router-link to="/orders" class="hover:text-[var(--text)] transition-colors">Order History & Returns</router-link></li>
            <li><router-link to="/wishlist" class="hover:text-[var(--text)] transition-colors">Saved Wishlist</router-link></li>
            <li><a href="#fabric-guide" class="hover:text-[var(--text)] transition-colors">Size & Fabric Guide</a></li>
            <li><a href="#shipping" class="hover:text-[var(--text)] transition-colors">Shipping & Delivery Rates</a></li>
          </ul>
        </div>

        <!-- Column 4: Newsletter & Store Info -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-4">Stay In Touch</h4>
          <p class="text-xs text-[var(--text-muted)] mb-3">Subscribe for limited drops and 20% discount codes.</p>
          <form @submit.prevent="handleSubscribe" class="space-y-2">
            <input
              type="email"
              v-model="emailInput"
              placeholder="Your email address"
              required
              class="w-full px-3 py-2 text-xs bg-white border border-[var(--border)] rounded-sm text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              class="w-full py-2 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </form>
          <div class="mt-4 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] space-y-1">
            <p><i class="fa-solid fa-location-dot text-[var(--text-faint)] mr-1.5"></i> Phnom Penh, Cambodia</p>
            <p><i class="fa-solid fa-phone text-[var(--text-faint)] mr-1.5"></i> +855 23 999 888</p>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-faint)]">
        <p>&copy; 2026 MN T-Shirt Clothing Co. All rights reserved.</p>

        <!-- Payment Badges -->
        <div class="flex items-center gap-3">
          <span class="text-[var(--text-faint)] text-[11px]">Accepted Payment:</span>
          <span class="px-2 py-0.5 rounded-sm bg-white border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)]">ABA Pay / KHQR</span>
          <span class="px-2 py-0.5 rounded-sm bg-white border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)]">Visa / MC</span>
          <span class="px-2 py-0.5 rounded-sm bg-white border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)]">Store Credit</span>
        </div>
      </div>
    </div>
  </footer>
</template>


<script>
import { ref } from 'vue';
import { SuccessToast } from '@/functions/sweetalert';

export default {
  name: 'CustomerFooter',
  setup() {
    const emailInput = ref('');

    const handleSubscribe = () => {
      if (emailInput.value) {
        SuccessToast('Subscribed! Check your inbox for code "MN20"');
        emailInput.value = '';
      }
    };

    return {
      emailInput,
      handleSubscribe
    };
  }
};
</script>
