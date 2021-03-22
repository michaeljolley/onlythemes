import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Extension } from "../Models/extension";
import { Manifest } from "../Models/manifest";
import { AzureCI } from "../Azure/azureCI";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const payload = context.bindings.payload as any;
  const extension: Extension = payload.extension;
  const manifest: Manifest = payload.manifest;

  context.log(`ThemeProcessor: ${extension.displayName}`);

  const themesList = manifest.contributes.themes.map(m => m.label).join(';');

  // Deploy Azure Container Instance to generate screen shots
  const azureCI = new AzureCI();
  await azureCI.createCI(`${extension.publisher.publisherName}.${extension.extensionName}`, themesList);

  context.res = {
    status: 200
  };
};

export default httpTrigger;
