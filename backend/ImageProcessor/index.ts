import { AzureFunction, Context } from "@azure/functions"
import * as puppeteer from 'puppeteer';
import { Extension } from "../Models/extension";
import { AzureCI } from "./azureCI";

const activityFunction: AzureFunction = async function (context: Context): Promise<unknown> {

    const extension: Extension = context.bindings.extension;

    context.log(`ImageProcessor: ${extension.displayName}`);

    // Deploy Azure Container Instance
    const azureCI = new AzureCI();

    const x = await azureCI.createCI('dracula-theme.theme-dracula', 'Dracula Soft');


    // View VS Code served by container instance and take picture

    // Save picture to Azure storage

    // Destroy Azure Container Instance

    // (async () => {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();
    //     await page.goto('https://bbb.dev');
    //     await page.screenshot({ path: 'example.png' });

    //     await browser.close();
    // })();



    return undefined;
};

export default activityFunction;
