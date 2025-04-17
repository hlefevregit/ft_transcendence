// tailwind.config.js
module.exports = {
    theme: {
      extend: {
        keyframes: {
          walk: {
            '0%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
            '100%': { transform: 'translateY(0)' },
          },
        },
        animation: {
          'walk': 'walk 0.5s ease-in-out infinite',
        },
      },
    },
    plugins: [],
}