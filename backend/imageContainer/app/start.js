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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const comment_json_1 = require("comment-json");
const screenshot_1 = __importDefault(require("./screenshot"));
const saveTheme_1 = __importDefault(require("./saveTheme"));
let extensionDir = '';
const deleteCI = () => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default.post(`${process.env.FUNCTIONS_URL}DeleteCI`, { containerInstanceId: process.env.CONTAINER_INSTANCE });
});
const loadManifest = () => __awaiter(void 0, void 0, void 0, function* () {
    const manifestData = yield fs_1.promises.readFile(`/home/coder/.vscode/extensions/${extensionDir}/package.json`);
    return comment_json_1.parse(manifestData.toString());
});
const setTheme = (themeLabel) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(themeLabel);
    yield fs_1.promises.writeFile('/home/coder/.local/share/code-server/User/settings.json', `{\
    "workbench.colorTheme": "${themeLabel}"\
  }`);
});
const updateExtension = () => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default.get(`${process.env.FUNCTIONS_URL}ExtensionCataloged?extensionId=${process.env.EXTENSION_ID}`);
});
const recordError = (error) => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default.post(`${process.env.FUNCTIONS_URL}ExtensionError`, {
        extensionId: process.env.EXTENSION_ID,
        error
    });
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const extensionDirs = yield fs_1.promises.readdir('/home/coder/.vscode/extensions');
        extensionDir = extensionDirs[0];
        // Load the manifest
        const manifest = yield loadManifest();
        if (manifest && manifest.contributes.themes) {
            // for each theme in manifest
            for (const manifestTheme of manifest.contributes.themes) {
                try {
                    yield setTheme(manifestTheme.label);
                }
                catch (err) {
                    yield recordError(`setTheme: ${err}`);
                    throw (err);
                }
                try {
                    const theme = yield saveTheme_1.default(extensionDir, manifestTheme);
                    try {
                        yield screenshot_1.default(theme.id);
                    }
                    catch (err) {
                        yield recordError(`screenshot: ${err}`);
                        throw (err);
                    }
                    console.log(`Saved ${theme.name}`);
                }
                catch (err) {
                    yield recordError(`saveTheme: ${err}`);
                    throw (err);
                }
            }
        }
        yield updateExtension();
    }
    catch (err) {
        console.log(err);
    }
    yield deleteCI();
});
main();
