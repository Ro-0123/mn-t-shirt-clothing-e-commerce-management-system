<template>
  <transition name="scroll-top-fade">
    <button
      v-if="visible"
      @click="scrollToTop"
      aria-label="Back to top"
      title="Back to top"
      class="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[var(--text)] hover:bg-[var(--accent)] text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
    >
      <i class="fa-solid fa-arrow-up text-sm"></i>
    </button>
  </transition>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'ScrollToTop',
  setup() {
    const visible = ref(false);

    const handleScroll = () => {
      visible.value = window.scrollY > 400;
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }));
    onUnmounted(() => window.removeEventListener('scroll', handleScroll));

    return { visible, scrollToTop };
  },
};
</script>

<style scoped>
.scroll-top-fade-enter-active,
.scroll-top-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.scroll-top-fade-enter-from,
.scroll-top-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
