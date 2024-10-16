const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path'); // Path module to construct file paths

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'), // Path to your icon file
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.loadFile('start.html');

    // Remove the default menu
    Menu.setApplicationMenu(null);

    // Quit the app when the "quit-app" event is received
    ipcMain.on('quit-app', () => {
        app.quit();
    });

    // Close the current window when the "close-window" event is received
    ipcMain.on('close-window', () => {
        win.close();
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
