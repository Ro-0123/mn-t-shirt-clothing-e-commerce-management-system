<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <div class="storefront bg-[var(--surface)] w-full max-w-sm rounded-sm border border-[var(--border)] shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 divider">
          <h3 class="font-display text-sm text-[var(--text)]">Adjust Your Photo</h3>
          <button
            @click="$emit('cancel')"
            class="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--bg-alt)] text-[var(--text-muted)] cursor-pointer"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <div class="h-72 bg-[var(--bg-alt)] rounded-sm overflow-hidden">
            <Cropper
              ref="cropperRef"
              class="cropper"
              :src="imageSrc"
              :stencil-component="CircleStencil"
              :stencil-props="{ aspectRatio: 1 }"
              image-restriction="stencil"
            />
          </div>

          <div class="flex items-center gap-3 text-[var(--text-muted)]">
            <i class="fa-solid fa-magnifying-glass-minus text-xs"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="zoom"
              @input="applyZoom"
              class="flex-1 accent-[var(--accent)]"
            />
            <i class="fa-solid fa-magnifying-glass-plus text-xs"></i>
          </div>

          <p class="text-[11px] text-[var(--text-muted)] text-center">
            Drag to reposition, use the slider to zoom, then save.
          </p>

          <div class="flex items-center gap-3">
            <button
              @click="$emit('cancel')"
              class="flex-1 px-4 py-2.5 border border-[var(--border)] hover:bg-[var(--bg-alt)] text-[var(--text)] font-bold text-xs rounded-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              :disabled="isSaving"
              class="flex-1 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs rounded-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              <span v-else>Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref } from 'vue';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

export default {
  name: 'AvatarCropModal',
  components: { Cropper },
  props: {
    imageSrc: { type: String, required: true },
  },
  emits: ['save', 'cancel'],
  setup(_, { emit }) {
    const cropperRef = ref(null);
    const zoom = ref(0);
    const isSaving = ref(false);
    let lastFactor = 1;

    const applyZoom = () => {
      const targetFactor = 1 + zoom.value * 2;
      cropperRef.value?.zoom(targetFactor / lastFactor);
      lastFactor = targetFactor;
    };

    const handleSave = () => {
      const result = cropperRef.value?.getResult();
      if (!result?.canvas) return;
      isSaving.value = true;
      result.canvas.toBlob((blob) => {
        isSaving.value = false;
        if (blob) emit('save', blob);
      }, 'image/jpeg', 0.92);
    };

    return { cropperRef, CircleStencil, zoom, applyZoom, isSaving, handleSave };
  },
};
</script>

<style scoped>
.cropper {
  width: 100%;
  height: 100%;
}
</style>
