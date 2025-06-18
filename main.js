// require('electron-reload')(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`)
// });
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(app.getPath('userData'), 'questions.json');
console.log('State will be saved at:', DATA_FILE);

// Initialize questions data if file doesn't exist
function initializeData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {};
    for (let i = 1; i <= 151; i++) {
      initialData[i] = { attempted: false };
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 670,
    height: 670,
    icon: 'icon.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

// IPC handlers
ipcMain.handle('load-data', () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return {};
  }
});

ipcMain.handle('save-data', (event, data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
});

app.whenReady().then(() => {
  initializeData();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});