import { AzureFunction, Context } from "@azure/functions"
import * as puppeteer from 'puppeteer';
import { Extension } from "../Models/extension";

const activityFunction: AzureFunction = async function (context: Context): Promise<boolean> {

    const extension: Extension = context.bindings.extension;

    context.log(`ImageProcessor: ${extension.displayName}`);

    // Open headless Chrome and load VS Code

    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://bbb.dev');
        await page.screenshot({ path: 'example.png' });

        await browser.close();
    })();

    // Tell VS Code to install the extension

    // Take a picture of VS Code with puppeteer

    // Save picture to Azure storage

    return true;
};

export default activityFunction;
