/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: "#f472b6",
        primary_hover: "#ec4899",
      },
    },
  },
  plugins: ["@tailwindcss/forms"],
};
