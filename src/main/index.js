'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    height: 670,
    width: 1020,
    minHeight: 670,
    minWidth: 1020,
    show: false,
    frame: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})

ipcMain.on('open-dev-tools', (evt, arg) => {
  mainWindow.webContents.openDevTools()
})

ipcMain.on('delete-vuex-store-data', (evt, arg) => {
  let vuexJsonPath = app.getPath('userData') + '/vuex.json'

  fs.unlink(vuexJsonPath, (err) => {
    if (err) {
      evt.sender.send('show-notify', ['清除所有内容和设定失败：' + err.errno, 'e'])
      return
    }
    evt.sender.send('reload-page')
  })
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
