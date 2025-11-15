// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,
  modules: [
    "@sidebase/nuxt-pdf",
    "nuxt-swiper",
    "@vite-pwa/nuxt",
  ],
  pwa: {
    manifest: {
      name: "Catering App",
      description: "Mobile catering order management app",
      theme_color: "#3880ff",
    },
  },
  css: [
    '@ionic/vue/css/core.css',
    '@ionic/vue/css/normalize.css',
    '@ionic/vue/css/structure.css',
    '@ionic/vue/css/typography.css',
    '@ionic/vue/css/padding.css',
    '@ionic/vue/css/float-elements.css',
    '@ionic/vue/css/text-alignment.css',
    '@ionic/vue/css/text-transformation.css',
    '@ionic/vue/css/flex-utils.css',
    '@ionic/vue/css/display.css',
  ],
  build: {
    transpile: ['@ionic/vue'],
  },
});
