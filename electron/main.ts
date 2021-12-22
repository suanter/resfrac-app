import { app, BrowserWindow, ipcMain } from 'electron';
import { AuthFlow, AuthStateEmitter } from './flow';
import * as path from "path";
import * as url from "url";

import { createConnection } from 'typeorm';

import {User} from '../src/app/database/model/user.schema'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null;

const isDevMode = process.execPath.match(/[\\/]electron/);

const createWindow = async () => {
  const connection = await createConnection({
    type: 'sqlite',
    synchronize: true,
    logging: true,
    logger: 'simple-console',
    database: 'database/data/database.sqlite',
    entities: [ User ],
  });

  const itemRepo = connection.getRepository(User);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.
  if (isDevMode) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  ipcMain.on('get-users', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await itemRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-user', async (event: any, _user: User) => {
    try {
      const user = await itemRepo.create(_user);
      await itemRepo.save(user);
      event.returnValue = await itemRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-user', async (event: any, _user: User) => {
    try {
      const item = await itemRepo.create(_user);
      await itemRepo.remove(item);
      event.returnValue = await itemRepo.find();
    } catch (err) {
      throw err;
    }
  }); 
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("ready", app_ready);

async function app_ready() {
  console.log("Creating a new Windows");
  createWindow();

}

function isRoot() {
  return path.parse(process.cwd()).root == process.cwd();
}


app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

const authFlow = new AuthFlow();

authFlow.authStateEmitter.on(
  AuthStateEmitter.ON_TOKEN_RESPONSE, received_user_info
);
async function received_user_info(user: JSON) {

  console.log("Received user logged information");
  console.log(user)
  mainWindow.webContents.send("user_logged", user);
}
async function signIn() {
  if (mainWindow === null) {
    createWindow();
  }

  if (!authFlow.loggedIn()) {
    await authFlow.fetchServiceConfiguration();
    await authFlow.makeAuthorizationRequest();
    mainWindow.webContents.send("user_logged", authFlow.getUserData());
  }
}
ipcMain.on("login_user", (event, action) => {
  console.log("Received a request to authenticate via google ");
  signIn();
});

ipcMain.on("get_user_data", (event, action) => {
  mainWindow.webContents.send("user_logged", authFlow.getUserData());
});

async function send_user_logout() {
  console.log("Sending  user_logged_out message");
  mainWindow.webContents.send("user_logged_out", {});
}

ipcMain.on("logout_user", (event, action) => {
  console.log("Received a request to logout ");
  if (authFlow.loggedIn()) {
    console.log("User was logged in, we logout the user ");
    send_user_logout()
    authFlow.signOut();
  }

});
