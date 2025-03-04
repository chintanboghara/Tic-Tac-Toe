/** @type {import('tailwindcss').Config} */
export default {
  // Specify the paths to all of your template files
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // Extend Tailwind's default theme here
    extend: {
      // Customizations go here, for example:
      // colors: {
      //   primary: '#1DA1F2',
      // },
    },
  },
  // Add plugins to extend Tailwind's functionality
  plugins: [],
};
