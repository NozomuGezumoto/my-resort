# Build Instructions

Production build documentation for My Resort Map.

---

## Pre-Submission Checklist

### Required Settings

| Item | Location | Status |
|------|----------|--------|
| **Google Maps API Key** | `app.json` → `expo.android.config.googleMaps.apiKey` | ⚠️ Replace `YOUR_GOOGLE_MAPS_API_KEY` |
| **Privacy Policy URL** | App Store Connect / Play Console | Must be published online |
| **Contact Email** | `docs/PRIVACY_POLICY.md` | Set your email address |
| **Support URL** | `docs/APP_STORE.md` | Set GitHub or website URL |

### Version Management

- `app.json` → `expo.version`: App version (e.g. 1.0.0)
- `app.json` → `expo.ios.buildNumber`: iOS build number (increment per submission)
- `app.json` → `expo.android.versionCode`: Android version code (increment per submission)

---

## Build Methods

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Configure build (first time only)
eas build:configure

# iOS build
eas build --platform ios --profile production

# Android build
eas build --platform android --profile production
```

`eas.json` is created by `eas build:configure`. Configure production profile as needed.

### Local Build (Xcode / Android Studio)

```bash
# Generate native project
npx expo prebuild

# iOS: Open ios/ in Xcode → Archive
# Android: Open android/ in Android Studio → Build → Generate Signed Bundle
```

---

## Google Maps API Key (Android)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps SDK for Android**
3. Create an **API key**
4. Set it in `app.json` → `expo.android.config.googleMaps.apiKey`

We recommend restricting the key by app signing for security.

---

## Troubleshooting

- **Map not showing (Android)**: API key may be missing or invalid
- **Build fails**: Run `npx expo doctor` to check environment
- **Icon not updating**: Run `npx expo prebuild --clean` for a clean build
