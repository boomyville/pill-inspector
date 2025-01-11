[app]
title = Object Detection
package.name = objectdetection
package.domain = org.yourdomain
source.dir = .
source.name = main.py
source.include_exts = py,png,jpg,kv,atlas
version = 0.1
requirements = python3,kivy,opencv-python,torch==2.0.0,typing_extensions,ultralytics,numpy,pillow,libffi
p4a.bootstrap = sdl2
p4a.ndk_flags = -Wno-macro-redefined
python.entrypoint = main.py

# Android specific
# https://raw.githubusercontent.com/kivy/buildozer/master/buildozer/default.spec

fullscreen = 0
android.presplash_color = #000000
android.permissions = CAMERA,READ_EXTERNAL_STORAGE,WRITE_EXTERNAL_STORAGE
android.api = 30
android.minapi = 24
android.ndk = 25b
android.archs = arm64-v8a
android.gradle_dependencies = org.pytorch:pytorch_android:2.0.0,org.pytorch:pytorch_android_torchvision:2.0.0

# Enable logging
android.logcat_filters = *:S python:D


# Enable FileProvider
android.enable_androidx = True

# Add provider paths XML
android.manifest.xml.path_provider = provider_paths.xml

# Add file paths XML to include_files
android.add_src = provider_paths.xml

[buildozer]
log_level = 2
warn_on_root = 1