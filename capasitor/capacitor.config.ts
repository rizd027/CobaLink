import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rizd027.listtoorder',
  appName: 'List To Order',
  webDir: '../out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
