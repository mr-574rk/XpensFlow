/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/App.jsx",
        "./src/main.jsx",
        "./src/**/*.jsx",
        "./src/**/*.js",
        "./src/**/*.tsx",
        "./src/**/*.ts",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            animation: {
                'scale-in': 'scale-in 0.2s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'slide-down': 'slide-down 0.3s ease-out',
            },
            keyframes: {
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-down': {
                    from: { opacity: '0', transform: 'translateY(-20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}