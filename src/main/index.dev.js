/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

async function installDevTools() {
  try {
    // eslint-disable-next-line
    require('devtron').install()
    // eslint-disable-next-line
    require('vue-devtools').install()
  } catch (err) {
    // eslint-disable-next-line
    console.error(err)
  }
}

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
require('electron').app.on('ready', () => {
  installDevTools()
})

// Require `main` process to boot app
require('./index')
