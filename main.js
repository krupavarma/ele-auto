const {
  app,
  BrowserWindow,
  Menu,
  protocol,
  ipcMain,
  dialog
} = require('electron');
const log = require('electron-log');
const latestUpdate = require('update-electron-app');
const { autoUpdater } = require('electron-updater');
//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
console.log(process.env.NODE_ENV);
//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
let template = [];
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }
    ]
  });
}

//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
function createDefaultWindow() {
  win = new BrowserWindow({
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    },
    width: 1024,
    height: 768,
    resizable: true
  });
  win.maximize();
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  // win.loadURL('file://' + __dirname + '/version.html');
  //win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}}`);
  win.loadURL(`file://${__dirname}/src/index.html`);
  return win;
}

process.env.GH_TOKEN_TESTING = process.env.GH_TOKEN_TESTING
  ? process.env.GH_TOKEN_TESTING
  : '84e7205d59342c180a69' + '1a4a223e58b19d9c4325';
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'krupavarma',
  repo: 'ele-auto',
  // token: process.env('GH_TOKEN')
  token: process.env.GH_TOKEN_TESTING,
  private: false
});
// console.log(process.env.NODE_ENV);
var downloadInprogress = false;
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', info => {
  // dialog.showMessageBox({
  //   message: 'checking-for-update !!'
  // });
  sendStatusToWindow('Update available.');
  downloadInprogress = true;
});
autoUpdater.on('update-not-available', info => {
  // sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', err => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', progressObj => {
  sendStatusToWindow(
    'Downloaded ' +
      (Math.round(progressObj.percent * 100) / 100).toFixed(2) +
      '%'
  );
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message =
    log_message +
    ' (' +
    progressObj.transferred +
    '/' +
    progressObj.total +
    ')';
});
autoUpdater.on('update-downloaded', (ev, info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  sendStatusToWindow('Update downloaded');

  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000);
});
app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createDefaultWindow();
});
app.disableHardwareAcceleration();
app.on('window-all-closed', () => {
  app.quit();
});

//
// CHOOSE one of the following options for Auto updates
//

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------
app.on('ready', function() {
  autoUpdater.checkForUpdatesAndNotify();
});
setInterval(() => {
  console.log('true or false', downloadInprogress);
  if (downloadInprogress == false) {
    autoUpdater.checkForUpdates();
  }
}, 1000);
//-------------------------------------------------------------------
// Auto updates - Option 2 - More control
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
// autoUpdater.on('update-downloaded', (info) => {
//   autoUpdater.quitAndInstall();
// })
