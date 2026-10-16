<template>
  <div ref="container"></div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue';

let scriptPromise = null;

const loadRecaptchaScript = () => {
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    window.__onRecaptchaLoad = resolve;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export default {
  name: 'Recaptcha',
  emits: ['verify', 'expired'],
  setup(_, { emit }) {
    const container = ref(null);
    let widgetId = null;

    onMounted(async () => {
      await loadRecaptchaScript();
      widgetId = window.grecaptcha.render(container.value, {
        sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        theme: 'dark',
        callback: (token) => emit('verify', token),
        'expired-callback': () => emit('expired'),
      });
    });

    onBeforeUnmount(() => {
      if (widgetId !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId);
      }
    });

    const reset = () => {
      if (widgetId !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId);
      }
    };

    return { container, reset };
  }
};
</script>
