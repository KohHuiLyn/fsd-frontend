# API Setup Guide

## Environment Variables

Create a `.env` file in the project root with the following:

```env
LOGIN_URL=http://localhost:3000
```

### Platform-Specific URLs

The service automatically converts `localhost` to the correct address based on the platform:

- **Android Emulator**: Automatically converts `localhost` → `10.0.2.2`
  - Your `.env` can still use `LOGIN_URL=http://localhost:3000`
  - The code will automatically use `http://10.0.2.2:3000` on Android emulator

- **iOS Simulator**: Uses `localhost` as-is
  - `LOGIN_URL=http://localhost:3000` works directly

- **Physical Devices**: Use your computer's local IP address
  - Find your IP: 
    - Windows: `ipconfig` (look for IPv4 Address)
    - Mac/Linux: `ifconfig` or `ip addr`
  - Example: `LOGIN_URL=http://192.168.1.100:3000`
  - Make sure your phone and computer are on the same WiFi network

### Important Notes

1. **No spaces around `=`**: Use `LOGIN_URL=http://localhost:3000` not `LOGIN_URL = "http://localhost:3000"`
2. **No quotes needed**: The code handles quotes automatically, but it's cleaner without them
3. **Restart Expo**: After changing `.env`, restart Expo (`npm start` or `npx expo start`)
4. **Check logs**: The app will log the final API Base URL on startup for debugging

## API Endpoints

All endpoints are constructed from the `LOGIN_URL` base:

- **Login**: `POST {LOGIN_URL}/auth/login`
  - Body: `{ email: string, password: string }`

- **Register**: `POST {LOGIN_URL}/auth/register`
  - Body: `{ email: string, username: string, phoneNumber: string, password: string, role: string }`

- **Logout**: `POST {LOGIN_URL}/auth/logout` (optional)

- **Get Current User**: `GET {LOGIN_URL}/auth/me` (optional)

## Troubleshooting

### Network Error on Android Emulator

If you see "Network request failed" on Android:
- The code automatically converts `localhost` to `10.0.2.2` for Android emulator
- Make sure your `.env` file has `LOGIN_URL=http://localhost:3000`
- Restart Expo after changing `.env`
- Check the console logs to see the final URL being used

### Network Error on Physical Device

If testing on a physical device:
- Use your computer's local IP address instead of `localhost`
- Example: `LOGIN_URL=http://192.168.1.100:3000`
- Make sure your device and computer are on the same WiFi network
- Make sure your backend server is accessible from the network (not bound to `127.0.0.1`)

### Backend Server Configuration

Make sure your backend server is configured to accept connections:
- For Android emulator: Server should listen on `0.0.0.0:3000` or `localhost:3000`
- For physical devices: Server should listen on `0.0.0.0:3000` (not just `127.0.0.1:3000`)

## Example `.env` file

```env
LOGIN_URL=http://localhost:3000
```

For physical device testing:
```env
LOGIN_URL=http://192.168.1.100:3000
```

