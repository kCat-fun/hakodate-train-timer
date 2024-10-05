require('dotenv').config();
const {
  API_KEY
} = process.env;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      apiKey: API_KEY,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'ja'
      },
      charset: "utf-8",
      viewport: "width=device-width",
      title: "市電LT用タイマー",
      meta: [
        {
          name: "description",
          content:
            "市電LT用タイマーです。移動速度等から、目的の電停までの所用時間を予測します。",
        },
      ],
    },
  },
  css: [
    "./assets/style/reset.css",
  ],
  components: [
    {
      path: "~/components/",
      pathPrefix: false,
    },
  ],
  plugins: [
  ]
})
