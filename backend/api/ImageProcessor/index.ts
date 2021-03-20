import { AzureFunction, Context } from "@azure/functions"
import { Extension } from "../Models/extension";
import { Theme } from "../Models/theme";
import { AzureCI } from "../Azure/azureCI";

const activityFunction: AzureFunction = async function (context: Context): Promise<boolean> {

    const payload = context.bindings.payload as any;
    const extension: Extension = payload.extension;
    const theme: Theme = payload.theme;

    context.log(`ImageProcessor: ${extension.displayName}`);

    // Deploy Azure Container Instance to generate
    // screen shots
    const azureCI = new AzureCI();
    await azureCI.createCI(`${extension.publisher.publisherName}.${extension.extensionName}`, theme.label);

    return true;
};

export default activityFunction;
