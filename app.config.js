import 'dotenv/config';

export default {
  expo: {
    owner: "gainzilla-healthninja",
    name: "jwt-auth-app",
    slug: "jwt-auth-app",
    extra: {
      eas: {
        projectId: "7d57a2c0-5f3b-45a6-a195-959864c010d3"
      },
      API_KEY: process.env.API_KEY,
      BASE_URL: process.env.BASE_URL,
    },
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "jwtauthapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCalendarsUsageDescription: "This app needs access to your calendar to show your schedule.",
        NSRemindersUsageDescription: "This app needs access to your reminders to manage calendar events."
  }
    },
    android: {
      package: "com.gainzilla.healthninja", 
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [

      "expo-font",
      "expo-web-browser",
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-secure-store",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
};
