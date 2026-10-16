<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full space-y-8 surface p-8 sm:p-10 border border-[var(--border)] rounded-sm">

      <!-- Brand & Heading -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-[var(--text)] text-white flex items-center justify-center font-display text-lg mx-auto">
          MN
        </div>
        <h1 class="font-display text-2xl text-[var(--text)]">Sign In to Your Account</h1>
        <p class="text-xs text-[var(--text-muted)]">Access your clothing bag, and management portals.</p>
      </div>

      <!-- Standard Form -->
      <form @submit.prevent="handleLogin" class="space-y-4 text-xs">
        <div class="space-y-1">
          <label class="font-bold text-[var(--text)]">Email Address</label>
          <input
            type="email"
            v-model="email"
            required
            class="w-full px-3.5 py-2.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
            placeholder="you@example.com"
          />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="font-bold text-[var(--text)]">Password</label>
            <a href="#" class="text-[var(--accent)] hover:underline text-[11px]">Forgot?</a>
          </div>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              required
              class="w-full px-3.5 py-2.5 pr-10 bg-[var(--bg-alt)] border border-[var(--border)] rounded-sm focus:bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)] font-medium text-[var(--text)]"
              placeholder="••••••••"
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
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="text-center text-xs text-[var(--text-muted)]">
        Don't have an account?
        <router-link to="/register" class="text-[var(--accent)] font-bold hover:underline">
          Register here
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
  name: 'Login',
  components: { Recaptcha },
  setup() {
    const store = useStore();
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const captchaToken = ref('');
    const recaptchaRef = ref(null);

    const isLoading = computed(() => store.getters['auth/isLoading']);

    const handleLogin = async () => {
      if (!captchaToken.value) {
        ErrorToast('Please complete the captcha');
        return;
      }

      try {
        const user = await store.dispatch('auth/login', {
          email: email.value,
          password: password.value,
          recaptchaToken: captchaToken.value
        });

        if (user.role === 'admin' || user.role === 'staff') {
          router.push('/admin/dashboard');
        } else {
          // Return customers to the page that sent them here (only same-site paths)
          const redirect = router.currentRoute.value.query.redirect;
          const isSafe = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//');
          router.push(isSafe ? redirect : '/');
        }
      } catch (error) {
        // Error is already handled by the store and toast is shown
        console.error('Login error:', error);
        captchaToken.value = '';
        recaptchaRef.value?.reset();
      }
    };

    return {
      email,
      password,
      showPassword,
      captchaToken,
      recaptchaRef,
      isLoading,
      handleLogin
    };
  }
};
</script>
