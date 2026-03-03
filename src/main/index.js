import { app, BrowserWindow, nativeImage, screen } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import started from 'electron-squirrel-startup';

const MIN_SPLASH_DURATION_MS = 4000;
const SPLASH_BASE_SCALE = 0.5;
const SPLASH_MIN_SCREEN_WIDTH_RATIO = 0.18;
const SPLASH_MAX_SCREEN_WIDTH_RATIO = 0.3;
const SPLASH_MAX_SCREEN_HEIGHT_RATIO = 0.34;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const getRendererAssetPath = (assetName) => (
  MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? path.join(process.cwd(), 'public', assetName)
    : path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/${assetName}`)
);

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const getSplashImageDataUrl = () => {
  const splashImagePath = getRendererAssetPath('splash-logo.png');
  const splashImageBase64 = fs.readFileSync(splashImagePath).toString('base64');
  return `data:image/png;base64,${splashImageBase64}`;
};

const getSplashGeometry = () => {
  const splashImagePath = getRendererAssetPath('splash-logo.png');
  const splashImage = nativeImage.createFromPath(splashImagePath);
  const { width: imageWidth, height: imageHeight } = splashImage.getSize();
  const { workAreaSize } = screen.getPrimaryDisplay();

  const aspectRatio = imageWidth > 0 && imageHeight > 0 ? imageHeight / imageWidth : 1;
  const baseWidth = 840 * SPLASH_BASE_SCALE;
  const minWidth = Math.round(workAreaSize.width * SPLASH_MIN_SCREEN_WIDTH_RATIO);
  const maxWidthByScreen = Math.round(workAreaSize.width * SPLASH_MAX_SCREEN_WIDTH_RATIO);
  const maxWidthByHeight = Math.round((workAreaSize.height * SPLASH_MAX_SCREEN_HEIGHT_RATIO) / aspectRatio);
  const imageDisplayWidth = Math.max(
    Math.min(baseWidth, maxWidthByScreen, maxWidthByHeight),
    Math.min(minWidth, maxWidthByScreen, maxWidthByHeight),
  );
  const imageDisplayHeight = Math.round(imageDisplayWidth * aspectRatio);

  return {
    imageDisplayWidth,
    imageDisplayHeight,
    windowWidth: imageDisplayWidth + 48,
    windowHeight: imageDisplayHeight + 48,
  };
};

const destroyWindow = (window) => {
  if (!window || window.isDestroyed()) {
    return;
  }

  window.destroy();
};

const createSplashWindow = () => {
  const splashImageUrl = getSplashImageDataUrl();
  const { imageDisplayWidth, windowWidth, windowHeight } = getSplashGeometry();
  const splashHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: transparent;
          }

          body {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          img {
            width: ${imageDisplayWidth}px;
            height: auto;
            display: block;
            object-fit: contain;
            user-select: none;
            -webkit-user-drag: none;
            filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.18));
            animation: float 1.8s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        </style>
      </head>
      <body>
        <img src="${splashImageUrl}" alt="" />
      </body>
    </html>
  `;

  const splashWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    useContentSize: true,
    center: true,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: '#00000000',
  });

  splashWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(splashHtml)}`);
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
    splashWindow.focus();
    splashWindow.setAlwaysOnTop(true, 'screen-saver');
  });
  return splashWindow;
};

const createMainWindow = () => {
  const display = screen.getPrimaryDisplay();
  const { workAreaSize } = display;
  const width = Math.max(1280, Math.min(1600, workAreaSize.width));
  const height = Math.max(820, Math.min(1000, workAreaSize.height));

  const mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1200,
    minHeight: 760,
    useContentSize: true,
    show: false,
    backgroundColor: '#e5e5e5',
    autoHideMenuBar: true,
    icon: path.join(process.cwd(), 'assets', 'favicon-analitics-app.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.removeMenu();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  return mainWindow;
};

const createWindow = async () => {
  const splashWindow = createSplashWindow();

  await delay(MIN_SPLASH_DURATION_MS);

  const mainWindow = createMainWindow();
  mainWindow.once('ready-to-show', () => {
    destroyWindow(splashWindow);
    if (!mainWindow.isDestroyed()) {
      mainWindow.maximize();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  mainWindow.on('closed', () => {
    destroyWindow(splashWindow);
  });

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
