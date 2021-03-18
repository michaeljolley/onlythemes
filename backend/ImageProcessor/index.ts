import { AzureFunction, Context } from "@azure/functions"
import { Extension } from "../Models/extension";
import { Theme } from "../Models/theme";
import { AzureCI } from "./azureCI";
import { screenshot } from "./screenshot";

const activityFunction: AzureFunction = async function (context: Context): Promise<boolean> {

    const payload = context.bindings.payload as any;
    const extension: Extension = payload.extension;
    const theme: Theme = payload.theme;

    context.log(`ImageProcessor: ${extension.displayName}`);

    // Deploy Azure Container Instance
    const azureCI = new AzureCI();

    const containerInstance = await azureCI.createCI(`${extension.publisher.publisherName}.${extension.extensionName}`, theme.label);

    const image = await screenshot(containerInstance.ipAddress?.fqdn);

    // Save picture to Azure storage

    await azureCI.destroyCI(containerInstance);

    return true;
};

export default activityFunction;
