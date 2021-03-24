import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Extension } from "../Models/extension";
import { AzureCI } from "../Azure/azureCI";

let _context: Context;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  _context = context;

  const extension: Extension = req.body.extension;

  context.log(`CreateCI: ${extension.displayName}`);

  // Deploy Azure Container Instance to generate screen shots
  const azureCI = new AzureCI();
  await azureCI.createCI(`${extension.publisher.publisherName}.${extension.extensionName}`, extension.extensionId);

  context.res = {
    status: 200
  };
};

export default httpTrigger;
