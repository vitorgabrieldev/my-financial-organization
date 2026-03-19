/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8a2d2d',
        'primary-dark': '#742121',
        border: '#dccaca',
        surface: '#fefdfd',
        ink: '#231c1c',
        muted: '#7e6666',
      },
      boxShadow: {
        soft: '0 12px 34px -24px rgba(61, 29, 29, 0.55)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
