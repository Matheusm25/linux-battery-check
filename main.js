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

async function render(tray = mainTray) {
  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: 'Parar',
      role: 'quit',
      enabled: true,
    },
    {
      label: 'teste',
      click: () => {
        win = new BrowserWindow({
          width: 300,
          height: 75,
          show: false,
          center: true,
          resizable: false,
          autoHideMenuBar: true,
          backgroundColor: '#333',
        });

        win.loadFile(resolve(__dirname, 'pages', 'low-battery.html'));

        win.once('ready-to-show', () => {
          win.show();
        });

        win.on('close', (event) => {
          event.preventDefault();
          if (win.isVisible()) {
            win.hide();
            win.close();
          }
          win = null;
        });
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', tray.popUpContextMenu);

  const [battery] = await linuxBattery();
  const { percentage } = battery;
  setInterval(() => console.log(percentage), 10000);
}

app.on('ready', () => {
  mainTray = new Tray(resolve(__dirname, 'assets', 'white-logo.png'));

  render(mainTray);
});
