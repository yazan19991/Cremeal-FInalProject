export default {
  "expo": {
    "name": "cremealApp",
    "slug": "cremealApp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/configurationImages/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/configurationImages/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.cremeal.firebasesignin",
      "googleServicesFile": process.env.GOOGLE_SERVICES_INFOPLIST
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/configurationImages/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.cremeal.firebasesignin",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/images/configurationImages/favicon.png"
    },
    "plugins": [
      "@react-native-google-signin/google-signin",
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "Allow $(PRODUCT_NAME) to access your camera",
          "enableFrameProcessors": true
        }
      ],

    ],
    "extra": {
      "eas": {
        "projectId": "5983f0ea-98e6-4108-b76e-29a9b7f80adb"
      }
    }
  }
}
