import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.json'],
  },
  optimizeDeps: {
    exclude: [
      'expo-local-authentication',
      'expo-notifications',
      'expo-device',
      'expo-constants',
      'expo-status-bar'
    ],
  },
})
