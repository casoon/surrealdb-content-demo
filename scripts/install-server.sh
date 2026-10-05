#!/usr/bin/env sh
# Downloads the official SurrealDB server binary into ./bin (not installed globally).
set -eu
VERSION="v3.3.0"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64)  TARGET="darwin-arm64" ;;
  Darwin-x86_64) TARGET="darwin-amd64" ;;
  Linux-x86_64)  TARGET="linux-amd64" ;;
  Linux-aarch64) TARGET="linux-arm64" ;;
  *) echo "Unsupported platform: $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac
URL="https://github.com/surrealdb/surrealdb/releases/download/${VERSION}/surreal-${VERSION}.${TARGET}.tgz"
mkdir -p bin
curl -fsSL "$URL" | tar -xz -C bin
chmod +x bin/surreal
bin/surreal version
