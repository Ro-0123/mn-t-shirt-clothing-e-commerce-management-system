<template>
  <!-- AdminLTE 3 Control Sidebar (Right Panel) -->
  <aside 
    v-if="isOpen"
    class="fixed inset-y-0 right-0 w-80 bg-[var(--surface)] text-[var(--text-muted)] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200"
  >
    <div class="p-4 border-b border-[var(--border)] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-sliders text-[var(--accent)]"></i>
        <h4 class="font-bold text-sm text-[var(--text)]">System Preferences</h4>
      </div>
      <button
        @click="$emit('close')"
        class="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-sm hover:bg-[var(--bg-alt)] cursor-pointer"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="p-4 flex-1 overflow-y-auto space-y-6 text-xs">
      <!-- Quick API sync -->
      <div class="space-y-2">
        <h5 class="font-bold text-[var(--text)] uppercase tracking-wider text-[11px]">DummyJSON Integration</h5>
        <p class="text-[var(--text-muted)] text-[11px] leading-relaxed">
          Sync DummyJSON shirt categories and mock products directly into our local database.
        </p>
        <button
          @click="syncDummy"
          class="w-full py-2 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-rotate"></i> Sync Products
        </button>
      </div>

      <!-- System Telemetry & Status -->
      <div class="space-y-3 pt-4 border-t border-[var(--border)]">
        <h5 class="font-bold text-[var(--text)] uppercase tracking-wider text-[11px]">Server Metrics</h5>
        <div class="bg-[var(--bg-alt)] p-3 rounded-sm space-y-2 border border-[var(--border)]">
          <div class="flex justify-between">
            <span class="text-[var(--text-muted)]">Environment</span>
            <span class="font-mono text-emerald-600">Node 22 / Vue 3</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--text-muted)]">Express API</span>
            <span class="font-mono text-[var(--accent)]">Online (:3000)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--text-muted)]">Active Database</span>
            <span class="font-mono text-[var(--text)]">MN In-Memory Store</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--text-muted)]">Theme</span>
            <span class="font-mono text-[var(--text)]">Modern Grayscale</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>


<script>
import { useStore } from 'vuex';

export default {
  name: 'ControlSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup() {
    const store = useStore();

    const syncDummy = () => {
      store.dispatch('admin/syncDummyJson');
    };

    return {
      syncDummy
    };
  }
};
</script>
