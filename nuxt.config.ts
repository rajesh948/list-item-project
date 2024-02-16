// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    "@invictus.codes/nuxt-vuetify",
    "@sidebase/nuxt-pdf",
    "nuxt-swiper",
    "@vite-pwa/nuxt",
  ],
  pwa: {
    manifest: {
      name: "Demo Site",
      description: "Some juicy description",
      theme_color: "#dddddd",
    },
  },
  // ssr: false,
});
