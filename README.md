# PlantPal

A mobile application for plant care management, plant identification, and garden tracking built with React Native and Expo.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** package manager
- **Java JDK** (required for Android development)
- **Android Studio** (for Android emulator)
- **Android Emulator** set up and running

## Setup Instructions

### 1. Install Android Studio and Set Up Emulator

1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio and go to **Tools → Device Manager**
3. Click **Create Device** and select a device (e.g., Pixel 5)
4. Download a system image (e.g., Android 13) if prompted
5. Finish the setup and start your emulator

**Important:** Make sure your Android emulator is running before starting the Expo development server.

### 2. Install Java JDK

Install Java JDK (version 11 or higher recommended). You can download it from:
- [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or
- [OpenJDK](https://adoptium.net/)

Make sure Java is in your system PATH. Verify installation by running:
```bash
java -version
```

### 3. Clone the Repository

```bash
git clone https://github.com/KohHuiLyn/fsd-frontend.git
cd fsd-frontend
```

### 4. Create Environment File

Create a `.env` file at the root of the project with the following variable:

```bash
EXPO_PUBLIC_API_GATEWAY_URL=your_api_gateway_url_here
```

Replace `your_api_gateway_url_here` with your actual API gateway URL.

**Example:**
```
EXPO_PUBLIC_API_GATEWAY_URL=https://api.example.com
```

### 5. Install Dependencies

```bash
npm i
```

### 6. Start the Development Server

```bash
npx expo start
```

This will start the Expo development server and open the Expo DevTools in your browser.

### 7. Run on Android Emulator

Once the development server is running:

- Press `a` in the terminal to open the app on your Android emulator
- Or use the command: `npx expo start --android`

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android emulator/device
- `npm run ios` - Start the app on iOS simulator/device (macOS only)
- `npm run web` - Start the app in web browser

## Troubleshooting

### Android Emulator Not Detected

- Ensure your Android emulator is running before starting Expo
- Check that `adb` is in your PATH: `adb devices`
- Restart the Expo server if the emulator was started after Expo

### Port Already in Use

If port 8081 is already in use:
```bash
npx expo start --port 8082
```

### Clear Cache

If you encounter issues, try clearing the cache:
```bash
npx expo start --clear
```

## Additional Notes

- The app uses Expo Router for navigation
- Make sure your Android emulator has sufficient RAM allocated (at least 2GB recommended)
- For the best experience, use Android API 33 or higher

