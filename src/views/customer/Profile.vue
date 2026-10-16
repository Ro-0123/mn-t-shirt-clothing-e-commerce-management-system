<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <div class="divider pb-5">
      <h1 class="font-display text-3xl sm:text-4xl text-[var(--text)]">Account Profile</h1>
      <p class="text-xs text-[var(--text-muted)] mt-1">Manage your identity, shipping address, and security credentials.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- Profile Card -->
      <div class="border border-[var(--border)] p-6 text-center space-y-4 rounded-sm">
        <div class="relative w-24 h-24 mx-auto">
          <img
            :src="user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'"
            alt="Profile Avatar"
            class="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--accent-soft)]"
          />
          <button
            type="button"
            @click="triggerAvatarPicker"
            :disabled="isUploadingAvatar"
            class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center text-xs border-2 border-white cursor-pointer transition-colors disabled:opacity-60"
            title="Change profile photo"
          >
            <i v-if="isUploadingAvatar" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-camera"></i>
          </button>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          />
        </div>

        <div>
          <h2 class="font-bold text-base text-[var(--text)]">{{ user?.name }}</h2>
          <p class="text-xs text-[var(--text-muted)]">{{ user?.email }}</p>
        </div>

        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" :class="getRoleBadgeClass(userRole)">
          <span class="w-2 h-2 rounded-full bg-current"></span>
          <span>{{ userRole }} Role</span>
        </div>

        <div class="divider pt-4 space-y-2 text-xs text-left">
          <div class="flex justify-between text-[var(--text-muted)]">
            <span>Customer Since</span>
            <span class="font-bold text-[var(--text)]">2026</span>
          </div>
          <div class="flex justify-between text-[var(--text-muted)]">
            <span>Primary Phone</span>
            <span class="font-bold text-[var(--text)]">{{ user?.phone }}</span>
          </div>
          <div class="flex justify-between text-[var(--text-muted)]">
            <span>Store Credit</span>
            <span class="font-bold text-[var(--accent)]">${{ Number(user?.storeCredit || 0).toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="userRole === 'Admin' || userRole === 'Staff'" class="pt-2">
          <router-link
            to="/admin/dashboard"
            class="w-full py-2 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <i class="fa-solid fa-gauge-high"></i>
            <span>Open AdminLTE Backoffice</span>
          </router-link>
        </div>
      </div>

      <!-- Update Details Form -->
      <div class="md:col-span-2 border border-[var(--border)] p-6 sm:p-8 space-y-6 rounded-sm">
        <h2 class="font-display text-xl text-[var(--text)] border-b border-[var(--border)] pb-3">
          Personal Information
        </h2>

        <form @submit.prevent="handleSave" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Display Name</label>
              <input
                type="text"
                v-model="name"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Email Address</label>
              <input
                type="email"
                v-model="email"
                disabled
                class="w-full px-3 py-2 bg-[var(--border)]/20 border border-[var(--border)] rounded-sm text-[var(--text-faint)] font-medium cursor-not-allowed"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">Mobile Phone</label>
              <input
                type="tel"
                v-model="phone"
                maxlength="10"
                inputmode="numeric"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-[var(--text)]">City / Province</label>
              <input
                type="text"
                v-model="city"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
              />
            </div>

            <div class="sm:col-span-2 space-y-1">
              <label class="font-bold text-[var(--text)]">Delivery Address</label>
              <textarea
                v-model="address"
                rows="2"
                class="w-full px-3 py-2 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
              ></textarea>
            </div>
          </div>

          <div class="divider pt-4 flex justify-end">
            <button
              type="submit"
              class="px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-sm font-bold text-xs transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

    </div>

    <AvatarCropModal
      v-if="cropImageSrc"
      :image-src="cropImageSrc"
      @save="handleCropSave"
      @cancel="closeCropModal"
    />
  </div>
</template>


<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import AvatarCropModal from '@/components/includes/AvatarCropModal.vue';

export default {
  name: 'Profile',
  components: { AvatarCropModal },
  setup() {
    const store = useStore();

    const user = computed(() => store.getters['auth/currentUser']);
    const userRole = computed(() => store.getters['auth/userRole']);

    const name = ref(user.value?.name || '');
    const email = ref(user.value?.email || '');
    const phone = ref(user.value?.phone || '');
    const city = ref(user.value?.city || 'Phnom Penh');
    const address = ref(user.value?.address || '');

    const avatarInput = ref(null);
    const isUploadingAvatar = ref(false);
    const cropImageSrc = ref('');

    const triggerAvatarPicker = () => {
      avatarInput.value?.click();
    };

    const closeCropModal = () => {
      if (cropImageSrc.value) URL.revokeObjectURL(cropImageSrc.value);
      cropImageSrc.value = '';
    };

    const handleAvatarChange = (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      cropImageSrc.value = URL.createObjectURL(file);
    };

    const handleCropSave = async (blob) => {
      isUploadingAvatar.value = true;
      try {
        await store.dispatch('auth/uploadAvatar', blob);
        closeCropModal();
      } catch (error) {
        // error toast already shown by the store action
      } finally {
        isUploadingAvatar.value = false;
      }
    };

    const getRoleBadgeClass = (role) => {
      switch (role) {
        case 'Admin': return 'bg-[var(--accent)] text-white';
        case 'Staff': return 'bg-[var(--text)] text-white';
        default: return 'border border-[var(--border-strong)] text-[var(--text-muted)]';
      }
    };

    const handleSave = async () => {
      const parts = name.value.trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] || user.value?.firstName || 'Customer';
      const lastName = parts.slice(1).join(' ') || user.value?.lastName || 'User';

      try {
        await store.dispatch('auth/updateProfile', {
          firstName,
          lastName,
          phone: phone.value,
          city: city.value,
          address: address.value,
        });
      } catch (error) {
        // error toast already shown by the store action
      }
    };

    return {
      user,
      userRole,
      name,
      email,
      phone,
      city,
      address,
      avatarInput,
      isUploadingAvatar,
      cropImageSrc,
      triggerAvatarPicker,
      handleAvatarChange,
      handleCropSave,
      closeCropModal,
      getRoleBadgeClass,
      handleSave
    };
  }
};
</script>
