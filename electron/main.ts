import { app, BrowserWindow, ipcMain } from "electron";
import { AuthFlow, AuthStateEmitter } from './flow';
import * as path from "path";
import * as url from "url";

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({ width: 1400, height: 600 });
  console.log("Created new window.");
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../../dist/ImageBrowser/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  console.log("executed url");
  win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });

}

app.on("ready", app_ready);

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

function isRoot() {
    return path.parse(process.cwd()).root == process.cwd();
}

const authFlow = new AuthFlow();

authFlow.authStateEmitter.on(
    AuthStateEmitter.ON_TOKEN_RESPONSE, received_user_info
);

async function received_user_info(user:JSON){

  console.log("Received user logged information");
  console.log(user)
  win.webContents.send("user_logged", user);
}
async function app_ready(){
  console.log("Creating a new Windows");
  createWindow();

}
async function signIn() {
  if (win === null) {
        createWindow();
  }

  if (!authFlow.loggedIn()) {
    await authFlow.fetchServiceConfiguration();
    await authFlow.makeAuthorizationRequest();
    win.webContents.send("user_logged", authFlow.getUserData());
  }
}

ipcMain.on("login_user", (event, action) => {
  console.log("Received a request to authenticate via google ");
  signIn();
});

ipcMain.on("get_user_data", (event, action) => {
  win.webContents.send("user_logged", authFlow.getUserData());
});

async function send_user_logout() {
    console.log("Sending  send_user_logout message");
    win.webContents.send("user_logged_out", authFlow.getUserData());
}

ipcMain.on("logout_user", (event, action) => {
  console.log("Received a request to logout ");
  if( authFlow.loggedIn()){
      console.log("User was logged in, we logout the user ");
       send_user_logout()
       authFlow.signOut();
      }
      
});


