import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.solkka.app',
  appName: 'Solkka',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
