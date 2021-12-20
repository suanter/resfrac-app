"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var electron_1 = require("electron");
var flow_1 = require("./flow");
var path = require("path");
var url = require("url");
var fs = require("fs");
var win;
function createWindow() {
    win = new electron_1.BrowserWindow({ width: 1400, height: 600 });
    console.log("Created new window.");
    win.loadURL(url.format({
        pathname: path.join(__dirname, "/../../dist/ImageBrowser/index.html"),
        protocol: "file:",
        slashes: true
    }));
    console.log("executed url");
    win.webContents.openDevTools();
    win.on("closed", function () {
        win = null;
    });
}
electron_1.app.on("ready", app_ready);
electron_1.app.on("activate", function () {
    if (win === null) {
        createWindow();
    }
});
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
function getImages() {
    var cwd = process.cwd();
    fs.readdir('.', { withFileTypes: true }, function (err, files) {
        if (!err) {
            var re_1 = /(?:\.([^.]+))?$/;
            var images = files
                .filter(function (file) { return file.isFile() && ['jpg', 'png'].includes(re_1.exec(file.name)[1]); })
                .map(function (file) { return "file://" + cwd + "/" + file.name; });
            win.webContents.send("getImagesResponse", images);
        }
    });
}
function isRoot() {
    return path.parse(process.cwd()).root == process.cwd();
}
function getDirectory() {
    fs.readdir('.', { withFileTypes: true }, function (err, files) {
        if (!err) {
            var directories = files
                .filter(function (file) { return file.isDirectory(); })
                .map(function (file) { return file.name; });
            if (!isRoot()) {
                directories.unshift('..');
            }
            win.webContents.send("getDirectoryResponse", directories);
        }
    });
}
electron_1.ipcMain.on("navigateDirectory", function (event, path) {
    process.chdir(path);
    getImages();
    getDirectory();
});
var authFlow = new flow_1.AuthFlow();
authFlow.authStateEmitter.on(flow_1.AuthStateEmitter.ON_TOKEN_RESPONSE, received_user_info);
// authFlow.authStateEmitter.on(
//     AuthStateEmitter.ON_TOKEN_RESPONSE, createWindow
// );
function received_user_info(user) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            console.log(" MAIN=> Received user logged information");
            console.log(user);
            win.webContents.send("user_logged", user);
            return [2 /*return*/];
        });
    });
}
function app_ready() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            console.log("Creating a new Windows");
            createWindow();
            return [2 /*return*/];
        });
    });
}
function signIn() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (win === null) {
                        createWindow();
                    }
                    if (!!authFlow.loggedIn()) return [3 /*break*/, 3];
                    return [4 /*yield*/, authFlow.fetchServiceConfiguration()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, authFlow.makeAuthorizationRequest()];
                case 2:
                    _a.sent();
                    win.webContents.send("user_logged", authFlow.getUserData());
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
electron_1.ipcMain.on("login_user", function (event, action) {
    console.log("Received a request to authenticate via google ");
    signIn();
});
electron_1.ipcMain.on("get_user_data", function (event, action) {
    win.webContents.send("user_logged", authFlow.getUserData());
});
electron_1.ipcMain.on("logout_user", function (event, action) {
    console.log("Received a request to logout ");
    if (authFlow.loggedIn()) {
        console.log("User was logged in, we logout the user ");
        authFlow.signOut();
    }
    win.webContents.send("user_logged_out", authFlow.getUserData());
});
//# sourceMappingURL=main.js.map