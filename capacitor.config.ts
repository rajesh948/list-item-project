import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cateringapp.mobile',
  appName: 'Catering App',
  webDir: '.output/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#dddddd',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small'
    },
    App: {
      swipeBack: true
    }
  }
};

export default config;
