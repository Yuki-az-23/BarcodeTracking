# Mobile App Build Guide

This guide covers building and deploying the mobile app to Android and iOS.

---

## Prerequisites

### For Android
- Android Studio
- Java JDK 17+
- Android SDK (API 33+)
- Gradle 8.0+

### For iOS
- macOS (required)
- Xcode 14+
- CocoaPods
- Apple Developer Account (for deployment)

---

## Setup

### 1. Install Capacitor CLI
```bash
cd app
npm install -g @capacitor/cli
```

### 2. Add Platforms
```bash
# Add Android
npx cap add android

# Add iOS (macOS only)
npx cap add ios
```

### 3. Initial Sync
```bash
npm run build
npx cap sync
```

---

## Android Build

### Development Build

1. **Build Web Assets**
   ```bash
   cd app
   npm run build
   npx cap sync android
   ```

2. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

3. **Run on Device/Emulator**
   - Click the "Run" button in Android Studio
   - Select device/emulator
   - App will install and launch

### Production Build

1. **Generate Signing Key** (first time only)
   ```bash
   cd app/android
   keytool -genkey -v -keystore my-release-key.keystore \
     -alias my-key-alias \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000
   ```

   Save the keystore file and remember your passwords!

2. **Configure Gradle** (`android/app/build.gradle`)
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file('my-release-key.keystore')
               storePassword 'your-keystore-password'
               keyAlias 'my-key-alias'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               shrinkResources true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build Release APK**
   ```bash
   cd app/android
   ./gradlew assembleRelease
   ```

   Output: `app/android/app/build/outputs/apk/release/app-release.apk`

4. **Build App Bundle (for Play Store)**
   ```bash
   ./gradlew bundleRelease
   ```

   Output: `app/android/app/build/outputs/bundle/release/app-release.aab`

### Testing Release Build

```bash
# Install on device
adb install app/build/outputs/apk/release/app-release.apk

# Or test bundle
bundletool build-apks --bundle=app-release.aab \
  --output=app.apks \
  --mode=universal

bundletool install-apks --apks=app.apks
```

---

## iOS Build

### Development Build

1. **Build Web Assets**
   ```bash
   cd app
   npm run build
   npx cap sync ios
   ```

2. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

3. **Configure Signing**
   - Select project in Xcode
   - Go to "Signing & Capabilities"
   - Select your Team
   - Xcode will create provisioning profile

4. **Run on Device/Simulator**
   - Select device/simulator
   - Click "Run" (⌘R)

### Production Build

1. **Update Version** (`ios/App/App/Info.plist`)
   ```xml
   <key>CFBundleShortVersionString</key>
   <string>1.0.0</string>
   <key>CFBundleVersion</key>
   <string>1</string>
   ```

2. **Archive App**
   - Xcode > Product > Archive
   - Wait for build to complete
   - Organizer window opens

3. **Distribute to App Store**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow prompts
   - Upload to TestFlight

4. **Or Export IPA**
   - Click "Distribute App"
   - Select "Ad Hoc" or "Development"
   - Export IPA file

---

## Environment Configuration

### Production vs Development

Create different environment files:

**`.env.production`** (app/)
```env
VITE_API_URL=https://api.yourapp.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key
```

**`.env.development`** (app/)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-key
```

### Build with Environment

```bash
# Development
npm run build

# Production
npm run build -- --mode production
```

---

## App Icons & Splash Screens

### Generate Assets

1. **Install capacitor-assets**
   ```bash
   npm install -D @capacitor/assets
   ```

2. **Prepare Source Images**
   - Icon: `resources/icon.png` (1024x1024)
   - Splash: `resources/splash.png` (2732x2732)

3. **Generate**
   ```bash
   npx capacitor-assets generate
   ```

   This creates all required sizes for iOS and Android

### Manual Setup

#### Android
- Place icons in `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Update `android/app/src/main/res/values/strings.xml`

#### iOS
- Use Assets.xcassets in Xcode
- Add AppIcon and LaunchImage

---

## App Store Submission

### Google Play Store

1. **Create App in Play Console**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app

2. **Upload AAB**
   - Go to "Release" > "Production"
   - Create new release
   - Upload `app-release.aab`

3. **Complete Store Listing**
   - App name, description
   - Screenshots (requires 2+ screenshots)
   - Icon (512x512)
   - Feature graphic (1024x500)
   - Category & tags

4. **Submit for Review**

### Apple App Store

1. **Create App in App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - My Apps > + > New App

2. **Upload Build**
   - Use Xcode Archive > Distribute
   - Or use Application Loader
   - Build appears in TestFlight

3. **Complete App Information**
   - Name, subtitle, description
   - Screenshots (all required sizes)
   - App icon
   - Privacy policy URL
   - Support URL

4. **Submit for Review**

---

## Troubleshooting

### Android

**"SDK location not found"**
```bash
# Create local.properties
echo "sdk.dir=/path/to/Android/sdk" > android/local.properties
```

**"Gradle build failed"**
```bash
cd android
./gradlew clean
./gradlew build
```

**"App not installed"**
- Uninstall existing version
- Check signing configuration
- Verify minimum SDK version

### iOS

**"Provisioning profile doesn't match"**
- Xcode > Preferences > Accounts
- Download Manual Profiles
- Or use Automatic Signing

**"Code Sign error"**
- Check certificate is valid
- Verify bundle identifier matches
- Regenerate provisioning profile

**"Launch screen not updating"**
- Clean build folder (⇧⌘K)
- Delete app from simulator
- Rebuild

---

## Continuous Integration

### GitHub Actions (Android)

```yaml
name: Android Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install dependencies
        run: |
          cd app
          npm install

      - name: Build web assets
        run: |
          cd app
          npm run build

      - name: Sync Capacitor
        run: |
          cd app
          npx cap sync android

      - name: Build APK
        run: |
          cd app/android
          ./gradlew assembleRelease

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: app/android/app/build/outputs/apk/release/app-release.apk
```

### Fastlane (iOS)

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build app"
  lane :build do
    build_app(
      scheme: "App",
      export_method: "app-store"
    )
  end

  desc "Upload to TestFlight"
  lane :beta do
    build_app(scheme: "App")
    upload_to_testflight
  end
end
```

---

## Version Management

### Bump Version

```bash
# Update package.json
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Sync to native
npx cap sync
```

### Android Version
Edit `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 2
        versionName "1.0.1"
    }
}
```

### iOS Version
Edit `ios/App/App.xcodeproj/project.pbxproj` or use Xcode UI

---

## Testing

### Device Testing

```bash
# List Android devices
adb devices

# Install on specific device
adb -s DEVICE_ID install app-release.apk

# iOS devices (via Xcode)
# Select device from dropdown
```

### Beta Testing

**Android (Google Play)**
- Create internal/closed/open testing track
- Upload AAB
- Add testers by email

**iOS (TestFlight)**
- Upload build via Xcode
- Add internal/external testers
- Get public link for external testing

---

## Performance

### Optimize Build Size

**Android**
```gradle
// Enable ProGuard
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

**iOS**
- Use App Thinning (automatic)
- Enable Bitcode in Build Settings
- Optimize images with Xcode

### Measure Performance

```bash
# Android
adb shell am start-activity -W com.barcode.tracker/.MainActivity

# iOS - use Instruments in Xcode
```

---

**Last Updated:** November 4, 2025
