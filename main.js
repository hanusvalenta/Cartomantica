const { app, BrowserWindow, ipcMain, Menu } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Ensure that contextIsolation is disabled so we can use ipcRenderer
        }
    });

    win.loadFile('start.html');

    // Remove the default menu
    Menu.setApplicationMenu(null); // This line removes the menu bar

    // Listen for the "quit-app" event and quit the application
    ipcMain.on('quit-app', () => {
        app.quit();
    });

    // Listen for the "close-window" event and close the current window
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
