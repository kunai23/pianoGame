const { app, BrowserWindow } = require('nw');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: 'Piano App',
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/piano.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
