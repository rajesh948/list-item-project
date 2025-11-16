// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-11-15',
  devtools: { enabled: false },
  ssr: false,
  spaLoadingTemplate: 'app/spa-loading-template.html',
  app: {
    pageTransition: false,
    layoutTransition: false,
  },
  modules: [
    "@pinia/nuxt",
    "@sidebase/nuxt-pdf",
    "nuxt-swiper",
    "@vite-pwa/nuxt",
  ],
  pwa: {
    manifest: {
      name: "CaterHub",
      short_name: "CaterHub",
      description: "Professional Catering Management Platform",
      theme_color: "#667eea",
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
    '~/assets/css/theme.css',
  ],
  build: {
    transpile: ['@ionic/vue'],
  },
});
