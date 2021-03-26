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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTheme = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const comment_json_1 = require("comment-json");
const axios_1 = __importDefault(require("axios"));
const saveTheme = (extensionDir, manifestTheme) => __awaiter(void 0, void 0, void 0, function* () {
    const colorPath = path.join(`/home/coder/.vscode/extensions/${extensionDir}/`, manifestTheme.path);
    const themeData = yield fs_1.promises.readFile(colorPath);
    const rawTheme = comment_json_1.parse(themeData.toString());
    // format that JSON to match the TypeScript model for Theme
    const theme = {
        name: rawTheme.name,
        colors: rawTheme.colors,
        tokenColors: rawTheme.tokenColors,
        semanticHighlighting: rawTheme.semanticHighlighting,
        extensionId: process.env.EXTENSION
    };
    // save that object to CosmosDb
    return yield _saveTheme(theme);
});
exports.saveTheme = saveTheme;
const _saveTheme = (theme) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post(`${process.env.FUNCTIONS_URL}ThemeUpsert`, { theme });
    return response.data;
});
exports.default = exports.saveTheme;
