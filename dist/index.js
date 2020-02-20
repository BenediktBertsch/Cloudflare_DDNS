"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
//Docker Variables
//IPv4
var api_token = process.env.token;
var mail_address = process.env.mail;
var zone_identifier = process.env.zone;
var name = process.env.domain;
//Proxied
var proxied;
if (process.env.proxied == "true" || process.env.proxied == "TRUE") {
    proxied = true;
}
else {
    proxied = false;
}
var intervalmin = parseInt(process.env.interval, 10);
var ipv6active;
//IPv6
if (process.env.ipv6activate == "true" || process.env.ipv6activate == "TRUE") {
    ipv6active = true;
}
else {
    ipv6active = false;
}
//Start Program
main();
setInterval(function () {
    main();
}, intervalmin * 1000 * 60);
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var ipv4, ipv6, i, cf, dnsarray, ipv4updatemsg, ipv6updatemsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(new Date().toLocaleString('de-DE', { hour12: false }) + " Checking A and AAAA Records");
                    return [4 /*yield*/, HttpGet('https://v4.ident.me/')];
                case 1:
                    ipv4 = _a.sent();
                    return [4 /*yield*/, HttpGet('https://v6.ident.me/')];
                case 2:
                    ipv6 = _a.sent();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < api_token.length)) return [3 /*break*/, 9];
                    return [4 /*yield*/, HttpGetAndParams('https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records', 'api.cloudflare.com', api_token, mail_address)];
                case 4:
                    cf = _a.sent();
                    dnsarray = cf.data.result;
                    if (!(ipv4 != searchRecordIP(dnsarray, 'A'))) return [3 /*break*/, 6];
                    return [4 /*yield*/, UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records/', "PUT", 'api.cloudflare.com', api_token, mail_address, 'A', name, '91.23.87.106', 120, proxied, dnsarray)];
                case 5:
                    ipv4updatemsg = _a.sent();
                    if (ipv4updatemsg.data.success) {
                        console.log("A Record Updated");
                    }
                    _a.label = 6;
                case 6:
                    if (!(ipv6active && ipv6 != searchRecordIP(dnsarray, 'AAAA'))) return [3 /*break*/, 8];
                    return [4 /*yield*/, UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records/', "PUT", 'api.cloudflare.com', api_token, mail_address, 'AAAA', name, '2003:e2:bf3c:a985:eda4:ccf5:2fde:dd33', 120, proxied, dnsarray)];
                case 7:
                    ipv6updatemsg = _a.sent();
                    if (ipv6updatemsg.data.success) {
                        console.log("AAAA Record Updated");
                    }
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 3];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function HttpGet(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, axios_1.default.get(url).then(function (resp) {
                    return resp.data;
                }).catch(function (err) {
                    return err;
                })];
        });
    });
}
function HttpGetAndParams(url, Host, auth_key, auth_mail) {
    return __awaiter(this, void 0, void 0, function () {
        var instance;
        return __generator(this, function (_a) {
            instance = axios_1.default.create({
                headers: {
                    Host: Host,
                    'X-Auth-Key': auth_key,
                    'X-Auth-Email': auth_mail,
                    'Content-Type': 'application/json'
                }
            });
            return [2 /*return*/, instance(url).then(function (resp) {
                    return resp;
                }).catch(function (err) {
                    return err;
                })];
        });
    });
}
function UpdateIP(url, method, Host, auth_key, auth_mail, type, name, ipv4, ttl, proxied, recordarray) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, axios_1.default.put(url + searchRecordID(recordarray, type), {
                    type: type,
                    name: name,
                    content: ipv4,
                    ttl: ttl,
                    proxied: proxied
                }, {
                    headers: {
                        Host: Host,
                        'X-Auth-Key': auth_key,
                        'X-Auth-Email': auth_mail,
                        'Content-Type': 'application/json'
                    }
                }).then(function (resp) {
                    return resp;
                }).catch(function (err) {
                    return err;
                })];
        });
    });
}
function searchRecordID(recordarray, type) {
    var returnvalue = '';
    recordarray.forEach(function (rec) {
        if (rec.type === type) {
            returnvalue = rec.id;
        }
    });
    return returnvalue;
}
function searchRecordIP(recordarray, type) {
    var returnvalue = '';
    recordarray.forEach(function (rec) {
        if (rec.type === type) {
            returnvalue = rec.content;
        }
    });
    return returnvalue;
}
//# sourceMappingURL=index.js.map