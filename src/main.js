import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './index.css';

// Global sweetalert helpers
import { SuccessToast, ErrorToast, InfoToast } from './functions/sweetalert';

const app = createApp(App);

// Attach globals
app.config.globalProperties.$toast = {
  success: SuccessToast,
  error: ErrorToast,
  info: InfoToast
};

app.use(store);
app.use(router);

app.mount('#app');
