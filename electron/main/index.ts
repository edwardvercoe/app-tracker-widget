import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Tray,
  Menu,
  screen,
  nativeImage,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { update } from "./update";
import SupabaseService from "./supabaseService";
import Store from "electron-store";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
let tray: Tray | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
  // Create hidden main window
  win = new BrowserWindow({
    title: "App Tracker Widget",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    frame: false,
    transparent: true,
    width: 160, // Set appropriate size for your widget
    height: 160,
    show: false, // Window starts hidden
    skipTaskbar: true, // Hide from taskbar/dock
    webPreferences: {
      preload,
    },
  });

  // Attempt to set window to desktop level (only works on macOS)
  // This will position the window at desktop level - behind regular apps
  if (process.platform === "darwin") {
    win.setWindowButtonVisibility(false);
    win.setAlwaysOnTop(true, "floating", -1); // Try to make it stay behind other windows
  }

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Hide window when it loses focus
  win.on("blur", () => {
    if (win) win.hide();
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Auto update
  update(win);
}

function createTray() {
  const iconPath = path.join(process.env.VITE_PUBLIC, "tray-icon.png");

  const image = nativeImage.createFromPath(iconPath);

  // For macOS, make it a template image
  if (process.platform === "darwin") {
    image.setTemplateImage(true);
  }

  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setToolTip("App Tracker Widget");

  // // Create context menu for tray
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: "Show App", click: () => showApp() },
  //   { type: "separator" },
  //   { label: "Refresh Data", click: () => refreshStats() },
  //   { type: "separator" },
  //   { label: "Quit", click: () => app.quit() },
  // ]);

  // // Set context menu on right-click
  // tray.setContextMenu(contextMenu);

  // Show app on left-click
  tray.on("click", (event, bounds) => showApp(bounds));
}

// Function to show the app and position it correctly
function showApp(bounds?: Electron.Rectangle) {
  if (!win) return;

  if (bounds) {
    // Position near the tray icon when clicked
    const { x, y } = bounds;
    const { width, height } = win.getBounds();
    const { height: displayHeight } = screen.getPrimaryDisplay().workAreaSize;

    // Position window based on whether tray is at top or bottom
    const yPosition = y > displayHeight / 2 ? y - height : y;

    win.setPosition(x - width / 2, yPosition);
  }

  win.show();
  win.focus();
}

// Create instances of your services
const supabaseService = new SupabaseService();
const statsStore = new Store({ name: "stats" });

// Add this section to set up IPC handlers
function setupIpcHandlers() {
  // Handler for setting Supabase credentials
  ipcMain.handle("set-supabase-credentials", async (_, url, key) => {
    console.log("Received request to set Supabase credentials");
    const success = supabaseService.initialize(url, key);

    if (success) {
      // If successful, refresh stats immediately
      await refreshStats();
      console.log("Successfully set Supabase credentials and refreshed stats");
    } else {
      console.log("Failed to set Supabase credentials");
    }

    return success;
  });

  // Handler for getting the last stats
  ipcMain.handle("get-last-stats", () => {
    return statsStore.get("lastStats");
  });

  // Handler for manually refreshing stats
  ipcMain.handle("refresh-stats", refreshStats);
}

// Function to refresh stats
async function refreshStats() {
  if (!supabaseService.isAuthenticated()) {
    console.log("Cannot refresh stats: Supabase not authenticated");
    return null;
  }

  try {
    console.log("Refreshing stats from Supabase...");
    const stats = await supabaseService.getUserStats();
    statsStore.set("lastStats", stats);
    win?.webContents.send("stats-updated", stats);

    // Update tray title with user stats (macOS only)
    if (process.platform === "darwin" && tray) {
      // Format: Display total users and daily signups if available
      let title = "";
      if (stats?.totalUsers !== undefined) {
        title = `${stats.totalUsers.toLocaleString()} `;

        // Add daily signups with arrow if there are any
        if (stats.dailySignups > 0) {
          title += ` +${stats.dailySignups.toLocaleString()}`;
        }
      }
      tray.setTitle(title);
    }

    console.log("Stats refreshed successfully:", stats);
    return stats;
  } catch (error) {
    console.error("Failed to refresh stats:", error);
    return null;
  }
}

// Make sure to call setupIpcHandlers when the app is ready
app.whenReady().then(() => {
  // Hide dock icon on macOS to make it a proper menu bar app
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  createWindow();
  createTray();
  setupIpcHandlers();

  // If Supabase is authenticated, start fetching stats
  if (supabaseService.isAuthenticated()) {
    refreshStats();
    // Refresh stats every hour
    setInterval(refreshStats, 36e5);
  }
});

// Prevent app from closing when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, don't quit the app
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
