import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React and related libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }
            if (id.includes('axios') || id.includes('zustand')) {
              return 'vendor-utils'
            }
            // Other node_modules go to vendor chunk
            return 'vendor'
          }
          
          // Split admin components into separate chunks
          if (id.includes('/Admin/')) {
            if (id.includes('UserManagement') || id.includes('CourseManagement')) {
              return 'admin-management'
            }
            if (id.includes('FinancialDashboard') || id.includes('AnalyticsDashboard')) {
              return 'admin-dashboards'
            }
            if (id.includes('SystemSettings') || id.includes('SecurityMonitoring')) {
              return 'admin-system'
            }
            if (id.includes('DataTable') || id.includes('VirtualizedDataTable')) {
              return 'admin-tables'
            }
            return 'admin-core'
          }
          
          // Split by page groups
          if (id.includes('/Pages/Auth/')) {
            return 'pages-auth'
          }
          if (id.includes('/Pages/Courses/')) {
            return 'pages-courses'
          }
          if (id.includes('/Pages/Portfolio/')) {
            return 'pages-portfolio'
          }
          if (id.includes('/Pages/Dashboard/') || id.includes('/Pages/Instructor/')) {
            return 'pages-dashboard'
          }
          if (id.includes('/Pages/Assignments/') || id.includes('/Pages/Lessons/')) {
            return 'pages-learning'
          }
          
          // Performance utilities
          if (id.includes('performanceMonitor') || id.includes('adminCache')) {
            return 'performance-utils'
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            return 'assets/[name]-[hash].js'
          }
          return 'assets/chunk-[hash].js'
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/css/i.test(ext)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Optimize chunk size - increased for admin components
    chunkSizeWarningLimit: 1500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
        // Additional optimizations
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    },
    // Enable source maps for production debugging (optional)
    sourcemap: process.env.NODE_ENV === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // Set target for better browser support
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    // Increase worker pool for faster builds
    reportCompressedSize: false,
  },
  // Enable caching and optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion', 
      'axios', 
      'zustand'
    ],
    // Force pre-bundling of these dependencies
    force: false,
    // Exclude large dependencies that should be loaded on demand
    exclude: ['fast-check']
  },
  // Enable experimental features for better performance
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable tree shaking
    treeShaking: true,
    // Additional optimizations
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  // Configure CSS processing
  css: {
    // Enable CSS modules only for .module.css files
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      // Only apply CSS modules to files with .module.css extension
      include: /\.module\.css$/
    },
    // PostCSS configuration - let Vite use postcss.config.js
    postcss: './postcss.config.js',
    // Enable CSS code splitting
    devSourcemap: process.env.NODE_ENV === 'development'
  },
  // Performance optimizations
  define: {
    // Remove development-only code in production
    __DEV__: process.env.NODE_ENV === 'development',
  },
  // Worker configuration for better performance
  worker: {
    format: 'es'
  }
})
