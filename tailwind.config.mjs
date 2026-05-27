/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        forest: 'var(--color-forest)',
        border: 'var(--border)',
        text: 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        surface: 'var(--bg-card)',
        bg: 'var(--bg-primary)'
      }
    },
  },
  plugins: [],
}
