const { resolve } = require('path');
const {
  app,
  Tray,
  Menu,
  BrowserWindow,
} = require('electron');

const linuxBattery = require('linux-battery');

const tray = null;

let win;

let mainTray = {};

let time = 300000;

function openWarning() {
  win = new BrowserWindow({
    width: 300,
    height: 75,
    show: false,
    center: true,
    resizable: false,
    autoHideMenuBar: true,
    backgroundColor: '#333',
    skipTaskbar: true,
  });

  win.loadFile(resolve(__dirname, 'pages', 'low-battery.html'));

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('close', (event) => {
    event.preventDefault();
    if (win && win.isVisible()) {
      win.hide();
      win.close();
    }
    win = null;
  });
}

function checkBattery(percentage) {
  let level = percentage.replace('%', '');
  level = parseInt(level, 10);

  if (level <= 10) {
    time = 180000;
  } else {
    time = 300000;
  }

  if (level <= 20) {
    openWarning();
  }
}

async function render(tray = mainTray) {
  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: 'Stop',
      enabled: true,
      click: () => {
        process.exit(0);
        app.exit(0);
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', tray.popUpContextMenu);

  setInterval(async () => {
    const [battery] = await linuxBattery();
    if (battery.state !== 'charging') {
      const { percentage } = battery;
      checkBattery(percentage);
    }
  }, time);
}

app.on('ready', () => {
  mainTray = new Tray(resolve(__dirname, 'assets', 'white-logo.png'));

  render(mainTray);
});
