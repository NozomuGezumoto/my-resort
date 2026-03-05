# My Resort Map 🏖️

A React Native (Expo) app to discover resort beaches on a map and record places you've visited or want to visit.

## Quick Start

```bash
npm install
npx expo start
```

Install Expo Go on your device and scan the QR code to run the app.

## Features

- 🏖️ **Resort beach map**: Explore beaches worldwide
- 📋 Record visited / want-to-go, photos, notes, and ratings
- Data stored locally only (no account required)

## Production Build

**Android**: Set your Google Maps API key in `app.json` → `expo.android.config.googleMaps.apiKey`.

See [docs/BUILD.md](docs/BUILD.md) for details.

## Project Structure

```
my-resort/
├── app/(tabs)/index.tsx    # Beach map screen
├── src/
│   ├── components/BeachMap.tsx
│   ├── data/beaches.json
│   ├── i18n/
│   └── store/              # Visited, want-to-go, etc.
├── docs/                   # Documentation
├── eas.json                # EAS Build config
└── app.json
```

## Documentation

| File | Description |
|------|-------------|
| [docs/BUILD.md](docs/BUILD.md) | Build instructions (EAS Build, local) |
| [docs/APP_STORE.md](docs/APP_STORE.md) | App Store / Play Store submission |
| [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) | Privacy policy |
| [docs/README.md](docs/README.md) | Documentation index |

## License

MIT License
