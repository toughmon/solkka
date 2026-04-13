# Solkka

Solkka is a Capacitor + React mobile app with a Node/Express backend.

## Frontend

- Vite + React + TypeScript
- Capacitor Android wrapper
- Tailwind CSS

## Backend

- Express
- PostgreSQL
- Socket.IO

## Android API configuration

The app uses a relative `/api/...` path in the frontend and rewrites it to `VITE_API_URL` at runtime in [`src/main.tsx`](./src/main.tsx).

For Android real-device builds, the following settings are required so the app can call a LAN HTTP backend:

- [`capacitor.config.ts`](./capacitor.config.ts)
  `server.cleartext: true`
- [`capacitor.config.ts`](./capacitor.config.ts)
  `server.androidScheme: 'http'`
- [`android/app/src/main/AndroidManifest.xml`](./android/app/src/main/AndroidManifest.xml)
  `android:usesCleartextTraffic="true"`
- [`android/app/src/main/AndroidManifest.xml`](./android/app/src/main/AndroidManifest.xml)
  `android:networkSecurityConfig="@xml/network_security_config"`
- [`android/app/src/main/res/xml/network_security_config.xml`](./android/app/src/main/res/xml/network_security_config.xml)
  cleartext traffic allowed
- [`android/app/src/main/java/com/solkka/app/MainActivity.java`](./android/app/src/main/java/com/solkka/app/MainActivity.java)
  `WebSettings.MIXED_CONTENT_ALWAYS_ALLOW`

## Incident note: Android app could open backend health URL in browser but failed inside app

Symptoms:

- Mobile browser could open `http://<LAN-IP>:3001/api/health`
- APK login and signup returned `TypeError: Failed to fetch`
- Backend request logs did not show `/api/auth/login` or `/api/auth/send-code`

Root cause:

- The Android WebView was loading the app under a secure/local scheme and was blocking mixed-content requests to the LAN `http://` backend.
- This was not a backend routing issue.
- This was not solved by backend availability alone.

Fix:

1. Keep Android cleartext enabled.
2. Force Capacitor Android to use `http` scheme.
3. Explicitly allow mixed content in `MainActivity`.
4. Keep CORS restricted to known development/mobile origins instead of globally allowing all origins.

## CORS policy

Default allowed origins in [`server/server.js`](./server/server.js):

- `http://localhost`
- `https://localhost`
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `capacitor://localhost`

If you need more origins, set `CORS_ORIGINS` in `server/.env` as a comma-separated list.

## Build notes

Frontend production build:

```bash
npm run build
```

Sync Capacitor Android assets:

```bash
npx cap sync android
```

Build debug APK:

```bash
cd android
./gradlew assembleDebug
```
