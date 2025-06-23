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
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
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
