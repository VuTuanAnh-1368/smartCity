import { AppRegistry } from 'react-native';
import App from './App'; // Ensure this path is correct, pointing to where your App component is defined
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';

// Create a notification channel for Android 8.0+ (API level 26+)
PushNotification.createChannel(
  {
    channelId: "default-channel-id", // Required
    channelName: "Default Channel", // Required
    channelDescription: "A default channel for general notifications", // Optional
    soundName: "default", // Optional
    importance: 4, // Required: high priority
    vibrate: true, // Optional
  },
  (created) => console.log(`CreateChannel returned '${created}'`) // Log whether the channel was created
);
AppRegistry.registerComponent(appName, () => App);
