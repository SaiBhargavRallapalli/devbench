import { app, BrowserWindow } from "electron";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PORT = 34567;
const APP_URL = () => `http://127.0.0.1:${process.env.DEVBENCH_PORT ?? DEFAULT_PORT}`;

/** @type {import("node:child_process").ChildProcess | null} */
let serverProcess = null;

function serverRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "server");
  }
  return path.resolve(__dirname, "resources/server");
}

function startNextServer() {
  const root = serverRoot();
  const serverJs = path.join(root, "server.js");
  const port = String(process.env.DEVBENCH_PORT ?? DEFAULT_PORT);

  serverProcess = spawn(process.execPath, [serverJs], {
    cwd: root,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: port,
      HOSTNAME: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout?.on("data", (chunk) => {
    console.log(`[devbench-server] ${chunk.toString().trimEnd()}`);
  });
  serverProcess.stderr?.on("data", (chunk) => {
    console.error(`[devbench-server] ${chunk.toString().trimEnd()}`);
  });
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // Server still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`DevBench server did not become ready at ${url}`);
}

function stopNextServer() {
  if (!serverProcess || serverProcess.killed) {
    return;
  }
  serverProcess.kill("SIGTERM");
  serverProcess = null;
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: "DevBench",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());
  await window.loadURL(APP_URL());

  return window;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [existing] = BrowserWindow.getAllWindows();
    if (existing) {
      if (existing.isMinimized()) existing.restore();
      existing.focus();
    }
  });

  app.whenReady().then(async () => {
    startNextServer();
    await waitForServer(APP_URL());
    await createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });

  app.on("before-quit", stopNextServer);
}
