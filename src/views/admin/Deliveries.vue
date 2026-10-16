<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display text-[var(--text)]">Manage Deliveries & Logistics</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Track courier assignments, delivery vehicles, and transit timestamps</p>
      </div>
    </div>

    <!-- Active Delivery Fleet Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-[var(--text)]">MN Express Courier Fleet</span>
          <span class="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">Active</span>
        </div>
        <p class="text-xs text-[var(--text-muted)]">Phnom Penh Intra-city 3-Hour Expedited Delivery Vans</p>
        <div class="flex justify-between text-xs pt-2 border-t border-[var(--border)] font-semibold text-[var(--text)]">
          <span>Active Couriers: 8</span>
          <span class="text-emerald-700">99.2% SLA</span>
        </div>
      </div>

      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-[var(--text)]">J&T Express Partner</span>
          <span class="px-2 py-0.5 rounded bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold">Connected</span>
        </div>
        <p class="text-xs text-[var(--text-muted)]">Provincial Hub Routing (Siem Reap, Battambang, Sihanoukville)</p>
        <div class="flex justify-between text-xs pt-2 border-t border-[var(--border)] font-semibold text-[var(--text)]">
          <span>Daily Dispatches: ~45</span>
          <span class="text-[var(--accent)]">24h SLA</span>
        </div>
      </div>

      <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-[var(--text)]">VET Express Dispatch</span>
          <span class="px-2 py-0.5 rounded bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-muted)] text-[10px] font-bold">Partner</span>
        </div>
        <p class="text-xs text-[var(--text-muted)]">Regional Bus & Cargo Transit across remote provinces</p>
        <div class="flex justify-between text-xs pt-2 border-t border-[var(--border)] font-semibold text-[var(--text)]">
          <span>Cross-Province SLA</span>
          <span class="text-[var(--text-muted)]">48h SLA</span>
        </div>
      </div>
    </div>

    <!-- Status Filter Tabs -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] p-4 flex flex-wrap items-center gap-1.5 text-xs">
      <button
        v-for="status in ['All', 'Pending', 'Dispatched', 'In Transit', 'Delivered', 'Returned', 'Failed']"
        :key="status"
        @click="selectedStatus = status"
        :class="selectedStatus === status ? 'bg-[var(--accent)] text-white font-bold' : 'bg-[var(--bg-alt)] text-[var(--text-muted)] hover:bg-[var(--border)] border border-[var(--border)]'"
        class="px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
      >
        {{ status }}
        <span class="opacity-70">({{ statusCounts[status] || 0 }})</span>
      </button>
    </div>

    <!-- Deliveries Table -->
    <div class="bg-[var(--surface)] rounded-sm border border-[var(--border)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border)] bg-[var(--bg-alt)] flex items-center justify-between text-xs font-bold text-[var(--text)]">
        <span>Delivery Waybill Dispatches</span>
        <span class="text-[var(--text-muted)] font-medium">Showing {{ filteredDeliveries.length }} of {{ deliveries.length }}</span>
      </div>

      <div class="overflow-auto max-h-[65vh]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] bg-[var(--surface)]">
              <th class="py-3 px-4 font-bold">Waybill / Order ID</th>
              <th class="py-3 px-4 font-bold">Recipient</th>
              <th class="py-3 px-4 font-bold">Assigned Courier</th>
              <th class="py-3 px-4 font-bold">Tracking #</th>
              <th class="py-3 px-4 font-bold">ETA</th>
              <th class="py-3 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="d in filteredDeliveries" :key="d.id" class="hover:bg-[var(--bg-alt)] transition-colors">
              <td class="py-3.5 px-4 font-mono font-bold text-[var(--accent)]">
                {{ d.orderId }}
              </td>

              <td class="py-3.5 px-4">
                <p class="font-bold text-[var(--text)]">{{ d.recipient }}</p>
                <p class="text-[10px] text-[var(--text-muted)]">{{ d.address }}</p>
              </td>

              <!-- Courier select -->
              <td class="py-3.5 px-4">
                <select
                  :value="d.carrier"
                  @change="updateCourier(d.id, $event.target.value)"
                  class="px-2 py-1 rounded-sm text-[11px] font-bold border border-[var(--border)] bg-[var(--bg-alt)] focus:bg-[var(--surface)] focus:outline-none text-[var(--text)]"
                >
                  <option value="MN Express Dispatch">MN Express Dispatch</option>
                  <option value="J&T Express Partner">J&T Express Partner</option>
                  <option value="VET Express Dispatch">VET Express Dispatch</option>
                </select>
              </td>

              <td class="py-3.5 px-4 font-mono text-[var(--text-muted)] font-semibold">
                {{ d.trackingNumber }}
              </td>

              <td class="py-3.5 px-4 text-[var(--text-muted)]">
                {{ d.estimatedDelivery }}
              </td>

              <!-- Status select -->
              <td class="py-3.5 px-4">
                <select
                  :value="d.status"
                  @change="updateStatus(d.id, $event.target.value)"
                  class="px-2 py-1 rounded-sm text-[11px] font-bold border focus:bg-[var(--surface)] focus:outline-none"
                  :class="getDeliveryStatusClass(d.status)"
                >
                  <option value="Pending">Pending</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Returned">Returned</option>
                  <option value="Failed">Failed</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AdminDeliveries',
  setup() {
    const store = useStore();

    const deliveries = computed(() => store.getters['admin/allDeliveries']);
    const selectedStatus = ref('All');

    const filteredDeliveries = computed(() => {
      if (selectedStatus.value === 'All') return deliveries.value;
      return deliveries.value.filter((d) => d.status === selectedStatus.value);
    });

    const statusCounts = computed(() => {
      const counts = { All: deliveries.value.length };
      for (const d of deliveries.value) {
        counts[d.status] = (counts[d.status] || 0) + 1;
      }
      return counts;
    });

    const getDeliveryStatusClass = (status) => {
      switch (status) {
        case 'Delivered': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        case 'In Transit': return 'text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent)]/20';
        case 'Dispatched': return 'text-purple-700 bg-purple-50 border-purple-200';
        case 'Returned': return 'text-amber-700 bg-amber-50 border-amber-200';
        case 'Failed': return 'text-rose-700 bg-rose-50 border-rose-200';
        default: return 'text-[var(--text-muted)] bg-[var(--bg-alt)] border-[var(--border)]';
      }
    };

    onMounted(() => {
      store.dispatch('admin/fetchDeliveries');
    });

    const updateCourier = (id, courierName) => {
      store.dispatch('admin/updateDeliveryStatus', { id, courierName });
    };

    const updateStatus = (id, status) => {
      store.dispatch('admin/updateDeliveryStatus', { id, status });
    };

    return {
      deliveries,
      selectedStatus,
      filteredDeliveries,
      statusCounts,
      getDeliveryStatusClass,
      updateCourier,
      updateStatus
    };
  }
};
</script>
