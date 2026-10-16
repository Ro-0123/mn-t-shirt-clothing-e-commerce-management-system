<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Store Information</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Configure store brand identity and policies</p>
      </div>

      <button
        @click="saveStoreInfo"
        class="px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs transition-colors cursor-pointer"
      >
        Save Store Settings
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Left Column: Business Details -->
      <div class="lg:col-span-2 bg-[var(--surface)] rounded-sm border border-[var(--border)] p-6 sm:p-8 space-y-6">
        <h3 class="font-bold text-sm text-[var(--text)] border-b border-[var(--border)] pb-3">Brand & Contact Details</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Store Name</label>
            <input type="text" v-model="info.name" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)]" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Support Email</label>
            <input type="email" v-model="info.email" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)]" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Helpline Phone</label>
            <input type="text" v-model="info.phone" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)]" />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">HQ Flagship Location</label>
            <input type="text" v-model="info.address" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)]" />
          </div>

          <div class="sm:col-span-2 space-y-1">
            <label class="font-bold text-[var(--text)]">Exchange & Return Policy Statement</label>
            <textarea v-model="info.returnPolicy" rows="3" class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm font-medium text-[var(--text)] focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)]"></textarea>
          </div>
        </div>
      </div>

      <!-- Right Column: Financial & Fulfillment Rules -->
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-6 space-y-6">
        <h3 class="font-bold text-sm text-[var(--text)] border-b border-[var(--border)] pb-3">Fulfillment Parameters</h3>

        <div class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-[var(--text)]">Store Base Currency</label>
            <input type="text" v-model="info.currency" disabled class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm text-[var(--text-faint)] font-bold" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AdminStoreInfo',
  setup() {
    const store = useStore();

    const info = ref({
      name: 'MN T-Shirt Clothing Co.',
      email: 'support@mntshirt.com',
      phone: '+855 23 999 888',
      address: 'Street 271, Sangkat Toul Tompoung, Khan Chamkarmon, Phnom Penh',
      returnPolicy: '14-day hassle-free exchanges on unworn garments with original hangtags intact.',
      currency: 'USD ($)'
    });

    onMounted(async () => {
      await store.dispatch('admin/fetchStoreInfo');
    });

    watch(() => store.getters['admin/storeInfoData'], (data) => {
      if (data) {
        info.value = { ...info.value, ...data };
      }
    }, { immediate: true });

    const saveStoreInfo = () => {
      store.dispatch('admin/updateStoreInfo', info.value);
    };

    return {
      info,
      saveStoreInfo
    };
  }
};
</script>
