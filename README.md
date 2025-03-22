# app-tracker-widget

Project forked from `electron-vite-react`

A desktop widget application that helps you monitor your app's user statistics in real-time directly from your system tray.

<img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg">
<img alt="Electron" src="https://img.shields.io/badge/electron-33.4.6-blue.svg">

[![Required Node.JS >= 14.18.0 || >=16.0.0](https://img.shields.io/static/v1?label=node&message=14.18.0%20||%20%3E=16.0.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

## 🔍 Overview

App Tracker Widget is a lightweight desktop application that:

- Connects to your Supabase backend to retrieve user statistics
- Displays total users and daily signups directly in your system tray
- Provides real-time updates of your app's growth metrics
- Works across platforms with a focus on macOS integration

## ✨ Features

- System Tray Integration: View your app's user count and daily signups at a glance
- Real-time Updates: Automatically refreshes statistics from Supabase
- Cross-platform: Works on macOS, Windows, and Linux (with enhanced macOS tray support)
- Auto-updates: Built-in update mechanism to ensure you always have the latest version

## 🛫 Quick Setup

```sh
# clone the project
git clone https://github.com/electron-vite/electron-vite-react.git

# enter the project directory
cd electron-vite-react

# install dependency
npm install

# develop
npm run dev

# Build for production
npm run build
```

## 📂 Directory structure

Familiar React application structure, just with `electron` folder on the top :wink:  
_Files in this folder will be separated from your React application and built into `dist-electron`_

```tree
├── electron                                 Electron-related code
│   ├── main                                 Main-process source code
│   └── preload                              Preload-scripts source code
│
├── release                                  Generated after production build, contains executables
│   └── {version}
│       ├── {os}-{os_arch}                   Contains unpacked application executable
│       └── {app_name}_{version}.{ext}       Installer for the application
│
├── public                                   Static assets
└── src                                      Renderer source code, your React application
```

## ⚙️ Configuration

To connect the widget to your Supabase instance:

Configure your Supabase credentials in the app settings
Ensure your Supabase database has the required tables and access permissions
Restart the application to begin tracking your statistics

## 🔧 Additional features

1. electron-updater 👉 [see docs](src/components/update/README.md)
1. playwright

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
