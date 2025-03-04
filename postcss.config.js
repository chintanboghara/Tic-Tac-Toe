/**
 * PostCSS Configuration
 *
 * This configuration enables Tailwind CSS and autoprefixer.
 * - Tailwind CSS: Processes your CSS using Tailwind's utility-first framework.
 * - Autoprefixer: Automatically adds vendor prefixes for cross-browser compatibility.
 */
export default {
  plugins: {
    tailwindcss: {}, // Process Tailwind CSS classes
    autoprefixer: {}, // Add vendor prefixes to CSS rules
  },
};
