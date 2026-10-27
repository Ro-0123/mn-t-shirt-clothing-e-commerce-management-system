<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      @click="toggle"
      class="w-36 px-3 py-2 bg-[var(--surface)] border rounded-sm text-xs font-medium text-left text-[var(--text)] flex items-center justify-between gap-2 transition-colors cursor-pointer"
      :class="isOpen ? 'border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'"
    >
      <span>{{ label }}</span>
      <i class="fa-regular fa-calendar text-[var(--text-muted)]"></i>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-30 mt-1 w-56 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-sm shadow-lg space-y-2"
    >
      <div class="flex items-center justify-between">
        <button type="button" @click="viewYear--" class="w-7 h-7 rounded-sm hover:bg-[var(--bg-alt)] text-[var(--text)] cursor-pointer" aria-label="Previous year">
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
        </button>
        <span class="text-xs font-bold text-[var(--text)]">{{ viewYear }}</span>
        <button type="button" @click="viewYear++" class="w-7 h-7 rounded-sm hover:bg-[var(--bg-alt)] text-[var(--text)] cursor-pointer" aria-label="Next year">
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-1">
        <button
          v-for="(name, idx) in MONTHS"
          :key="name"
          type="button"
          :disabled="isDisabled(idx)"
          @click="pick(idx)"
          class="py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :class="toValue(viewYear, idx) === modelValue
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--text)] hover:bg-[var(--bg-alt)]'"
        >
          {{ name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const toValue = (year, monthIdx) => `${year}-${String(monthIdx + 1).padStart(2, '0')}`;

// Picks a month as "YYYY-MM"; `min` / `max` (same format) disable months outside them
export default {
  name: 'MonthPicker',
  props: {
    modelValue: { type: String, required: true },
    min: { type: String, default: '' },
    max: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const viewYear = ref(Number(props.modelValue.slice(0, 4)));
    const rootRef = ref(null);

    const label = computed(() => {
      const [year, month] = props.modelValue.split('-');
      return `${MONTHS[Number(month) - 1]} ${year}`;
    });

    const toggle = () => {
      viewYear.value = Number(props.modelValue.slice(0, 4));
      isOpen.value = !isOpen.value;
    };

    // "YYYY-MM" strings compare correctly as plain strings. Must return a real
    // boolean: Vue renders :disabled="''" as disabled, and an unset min/max is ''.
    const isDisabled = (idx) => {
      const value = toValue(viewYear.value, idx);
      return Boolean((props.min && value < props.min) || (props.max && value > props.max));
    };

    const pick = (idx) => {
      emit('update:modelValue', toValue(viewYear.value, idx));
      isOpen.value = false;
    };

    const closeOnOutsideClick = (e) => {
      if (isOpen.value && rootRef.value && !rootRef.value.contains(e.target)) {
        isOpen.value = false;
      }
    };
    onMounted(() => document.addEventListener('click', closeOnOutsideClick));
    onUnmounted(() => document.removeEventListener('click', closeOnOutsideClick));

    return { MONTHS, toValue, isOpen, viewYear, rootRef, label, toggle, isDisabled, pick };
  }
};
</script>
