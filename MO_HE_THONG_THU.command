#!/bin/zsh
# Bộ chạy riêng ở Developer để không đồng bộ node_modules/dữ liệu thử lên Drive.
AHS_TRIAL_DIR="$HOME/Developer/AHS-LMS-local-sandbox"
AHS_TOOL_DIR="$HOME/Developer/AHS-LMS-local-sandbox-tools"
export JAVA_HOME="$AHS_TOOL_DIR/jdk-21.0.13+9-jre/Contents/Home"
export PATH="$JAVA_HOME/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
export AHS_SANDBOX_FIREBASE_BIN="$AHS_TOOL_DIR/node_modules/.bin/firebase"
export FIREBASE_EMULATORS_PATH="$AHS_TOOL_DIR/cache/emulators"
if [[ ! -f "$AHS_TRIAL_DIR/scripts/local-sandbox/start.cjs" || ! -x "$AHS_SANDBOX_FIREBASE_BIN" || ! -x "$JAVA_HOME/bin/java" ]]; then
  print 'Chưa có đủ bộ chạy hệ thống thử trên máy. Cần cài bộ chạy cục bộ trước.'
  read '?Nhấn Enter để đóng.'
  exit 1
fi
AHS_SOURCE_DIR="${0:A:h}"
if [[ "$AHS_SOURCE_DIR" != "$AHS_TRIAL_DIR" && -f "$AHS_SOURCE_DIR/package.json" ]]; then
  rsync -a --exclude=.git --exclude=node_modules --exclude=private --exclude=dist --exclude=.local-sandbox --exclude=.agents --exclude=.claude "$AHS_SOURCE_DIR/" "$AHS_TRIAL_DIR/" || exit 1
fi
cd "$AHS_TRIAL_DIR" || exit 1
node scripts/local-sandbox/start.cjs
read '?Hệ thống thử đã dừng. Nhấn Enter để đóng.'
