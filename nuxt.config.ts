// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  colorMode: {
    preference: "dark",
  },

  compatibilityDate: "2024-04-03",

  css: ["~/assets/css/main.css"],

  devtools: { enabled: true },

  modules: ["@nuxt/fonts", "@nuxt/ui", "@pinia/nuxt", "nuxt-svgo"],

  runtimeConfig: {
    public: {},
  },
});
