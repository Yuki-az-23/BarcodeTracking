import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barcode.tracker',
  appName: 'Barcode Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    Camera: {
      ios: {
        cameraUsageDescription: 'Required for scanning product barcodes'
      },
      android: {
        requestedPermissions: ['camera']
      }
    },
    Geolocation: {
      ios: {
        locationAlwaysUsageDescription: 'Required to verify warehouse location',
        locationWhenInUseUsageDescription: 'Required to verify warehouse location'
      },
      android: {
        requestedPermissions: [
          'ACCESS_FINE_LOCATION',
          'ACCESS_COARSE_LOCATION'
        ]
      }
    },
    LocalNotifications: {
      ios: {
        sound: 'beep.wav'
      },
      android: {
        smallIcon: 'ic_stat_icon',
        iconColor: '#488AFF',
        sound: 'beep.wav'
      }
    }
  }
};

export default config;
