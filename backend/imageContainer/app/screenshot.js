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
exports.screenshot = void 0;
// const puppeteer = require('puppeteer');
const puppeteer = __importStar(require("puppeteer"));
const screenshot = (themeId) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch({ args: ['--no-sandbox'] });
    const page = yield browser.newPage();
    yield page.setViewport({ width: 1920, height: 1080 });
    yield page.goto('http://127.0.0.1:8080/');
    yield page.waitForSelector('.activitybar');
    yield page.waitForTimeout(2000);
    yield page.keyboard.down('Control');
    yield page.keyboard.press('KeyO');
    yield page.keyboard.up('Control');
    yield page.waitForSelector('.ibwrapper input');
    yield page.waitForTimeout(2000);
    yield page.type('.ibwrapper input', 'superApp.js');
    yield page.waitForTimeout(1000);
    yield page.keyboard.press('Tab');
    yield page.keyboard.press('Enter');
    yield page.waitForTimeout(10000);
    const screenshot = yield page.screenshot({ path: `/images/${themeId}.png`, fullPage: true });
    yield browser.close();
});
exports.screenshot = screenshot;
exports.default = exports.screenshot;
