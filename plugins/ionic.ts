import { IonicVue } from '@ionic/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(IonicVue, {
    mode: 'md' // Use Material Design mode for consistent styling across platforms
  });
});
