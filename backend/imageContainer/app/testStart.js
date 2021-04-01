"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const comment_json_1 = require("comment-json");
const path = __importStar(require("path"));
const plistParser_1 = require("./vscode/plistParser");
const themeCapability_1 = require("./vscode/themeCapability");
const loadManifest = () => __awaiter(void 0, void 0, void 0, function* () {
    const dir = path.join(path.resolve(), "/test/package.json");
    const manifestData = yield fs_1.promises.readFile(dir, { encoding: 'utf-8' });
    return comment_json_1.parse(manifestData);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const manifest = yield loadManifest();
    if (manifest) {
        for (const manifestTheme of manifest.contributes.themes) {
            console.log(`Working on '${manifestTheme.label}'`);
            const themeDataPath = path.join(path.resolve(), "/test", manifestTheme.path);
            const themeData = yield fs_1.promises.readFile(themeDataPath, { encoding: 'utf-8' });
            const plist = plistParser_1.parse(themeData);
            if (path.extname(manifestTheme.path) === '.json') {
                // do normal color parsing     
            }
            else {
                let settings = plist.settings;
                if (!Array.isArray(settings)) {
                    return Promise.reject(new Error("error.plist.invalidformat"));
                }
                let result = {
                    textMateRules: [],
                    colors: {}
                };
                themeCapability_1.convertSettings(settings, result);
            }
        }
    }
});
main();
