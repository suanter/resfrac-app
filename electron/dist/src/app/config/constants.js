"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// Angular Modules
var core_1 = require("@angular/core");
var Constants = /** @class */ (function () {
    function Constants() {
    }
    Constants.API_OPEN_ID_CONNECT_URL = "https://accounts.google.com";
    Constants.API_OPEN_ID_CLIENT_ID = "511828570984-7nmej36h9j2tebiqmpqh835naet4vci4.apps.googleusercontent.com";
    Constants.API_OPEN_ID_REDIRECT_URL = "http://127.0.0.1:8000";
    Constants.API_ENDPOINT_WEATHER = 'https://api.openweathermap.org/data/2.5/weather?appid=aa252b0089012c353700f231304acb74&q=';
    Constants = tslib_1.__decorate([
        core_1.Injectable()
    ], Constants);
    return Constants;
}());
exports.Constants = Constants;
//# sourceMappingURL=constants.js.map