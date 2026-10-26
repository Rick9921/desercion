#!/usr/bin/env bash
# Desercion - de index.html a APK firmado.
# Requisitos: Node 18+, JDK 17, Android SDK (API 35), Android Studio.
set -euo pipefail

APP_ID="uy.rick.desercion"
APP_NAME="Desercion"

# 1. Proyecto y dependencias
npm install

# 2. El juego entero vive en www/index.html
mkdir -p www
# (copiar aqui el index.html entregado)
test -f www/index.html || { echo "Falta www/index.html"; exit 1; }

# 3. Plataforma Android
npx cap add android || true
npx cap sync android

# 4. Keystore (UNA sola vez - guardalo, sin el no podes actualizar la app nunca mas)
if [ ! -f desercion.keystore ]; then
  keytool -genkey -v \
    -keystore desercion.keystore \
    -alias prensacitrica \
    -keyalg RSA -keysize 2048 -validity 10000
fi

# 5. Build
export KEYSTORE_PATH="$(pwd)/desercion.keystore"
cd android

./gradlew assembleDebug      # APK de prueba, instalable directo
echo "Debug  -> android/app/build/outputs/apk/debug/app-debug.apk"

# Para Play Store hace falta el .aab, no el .apk:
# ./gradlew bundleRelease
# echo "Bundle -> android/app/build/outputs/bundle/release/app-release.aab"
