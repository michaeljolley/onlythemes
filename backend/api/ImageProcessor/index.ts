import { AzureFunction, Context } from "@azure/functions"
import { Extension } from "../Models/extension";
import { Manifest } from "../Models/manifest";
import { AzureCI } from "../Azure/azureCI";

const activityFunction: AzureFunction = async function (context: Context): Promise<boolean> {

    const payload = context.bindings.payload as any;
    const extension: Extension = payload.extension;
    const manifest: Manifest = payload.manifest;

    context.log(`ImageProcessor: ${extension.displayName}`);

    const themesList = manifest.contributes.themes.map(m => m.label).join(';');

    // Deploy Azure Container Instance to generate screen shots
    const azureCI = new AzureCI();
    await azureCI.createCI(`${extension.publisher.publisherName}.${extension.extensionName}`, themesList);

    return true;
};

export default activityFunction;
