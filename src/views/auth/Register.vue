<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full space-y-8 surface p-8 sm:p-10 border border-[var(--border)] rounded-sm">

      <!-- Brand & Heading -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-[var(--text)] text-white flex items-center justify-center font-display text-lg mx-auto">
          MN
        </div>
        <h1 class="font-display text-2xl text-[var(--text)]">Create an Account</h1>
        <p class="text-xs text-[var(--text-muted)]">Join MN T-Shirt Clothing to save favorites, earn points, and track shipments.</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4 text-xs">
        <div class="space-y-1">
          <label class="font-bold text-[var(--text)]">Customer Name</label>
          <input
            type="text"
            v-model="name"
            required
            class="w-full px-3.5 py-2.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
            placeholder="customer name"
          />
        </div>

        <div class="space-y-1">
          <label class="font-bold text-[var(--text)]">Email Address</label>
          <input
            type="email"
            v-model="email"
            required
            class="w-full px-3.5 py-2.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
            placeholder="customer@example.com"
          />
        </div>

        <div class="space-y-1">
          <label class="font-bold text-[var(--text)]">Mobile Phone</label>
          <input
            type="tel"
            v-model="phone"
            required
            maxlength="10"
            inputmode="numeric"
            class="w-full px-3.5 py-2.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
            placeholder="0xx xxx xxx"
          />
        </div>

        <div class="space-y-1">
          <label class="font-bold text-[var(--text)]">Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              required
              class="w-full px-3.5 py-2.5 pr-10 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
              placeholder="Minimum 6 characters"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :title="showPassword ? 'Hide password' : 'Show password'"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="flex justify-center">
          <Recaptcha ref="recaptchaRef" @verify="captchaToken = $event" @expired="captchaToken = ''" />
        </div>

        <button
          type="submit"
          :disabled="isLoading || !captchaToken"
          class="w-full py-3.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-faint)] text-white font-bold text-xs rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span v-else>Register Account</span>
        </button>
      </form>

      <div class="text-center text-xs text-[var(--text-muted)]">
        Already have an account?
        <router-link to="/login" class="text-[var(--accent)] font-bold hover:underline">
          Sign in here
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Recaptcha from '@/components/includes/Recaptcha.vue';
import { ErrorToast } from '@/functions/sweetalert';

export default {
  name: 'Register',
  components: { Recaptcha },
  setup() {
    const store = useStore();
    const router = useRouter();

    const name = ref('');
    const email = ref('');
    const phone = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const captchaToken = ref('');
    const recaptchaRef = ref(null);

    const isLoading = computed(() => store.getters['auth/isLoading']);

    const handleRegister = async () => {
      if (!name.value.trim()) {
        ErrorToast('Please enter your full name');
        return;
      }
      if (!email.value.trim()) {
        ErrorToast('Please enter your email');
        return;
      }
      if (!phone.value.trim()) {
        ErrorToast('Please enter your phone number');
        return;
      }
      if (!/^\d{9,10}$/.test(phone.value.trim())) {
        ErrorToast('Phone number must be 9-10 digits');
        return;
      }
      if (!password.value || password.value.length < 6) {
        ErrorToast('Password must be at least 6 characters');
        return;
      }
      if (!captchaToken.value) {
        ErrorToast('Please complete the captcha');
        return;
      }

      try {
        // Split name into firstName and lastName
        const nameParts = name.value.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const registrationData = {
          firstName,
          lastName,
          email: email.value.trim(),
          phone: phone.value.trim(),
          password: password.value,
          recaptchaToken: captchaToken.value
        };

        await store.dispatch('auth/register', registrationData);

        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error) {
        // Error toast already shown by the auth/register action
        captchaToken.value = '';
        recaptchaRef.value?.reset();
      }
    };

    return {
      name,
      email,
      phone,
      password,
      showPassword,
      captchaToken,
      recaptchaRef,
      isLoading,
      handleRegister
    };
  }
};
</script>


