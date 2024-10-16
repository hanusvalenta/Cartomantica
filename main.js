const { app, BrowserWindow, Menu, ipcMain } = require('electron');

ipcMain.on('exit-app', () => {
    app.quit(); // Quit the application
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,   // Set initial width
    height: 768,   // Set initial height
    minWidth: 800, // Set minimum width
    minHeight: 600, // Set minimum height
    webPreferences: {
        nodeIntegration: true,  // Enable Node.js integration
        contextIsolation: false  // Disable context isolation (for simplicity)
    }
    });

    win.loadFile('start.html');

    // Remove the default menu
    Menu.setApplicationMenu(null);
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