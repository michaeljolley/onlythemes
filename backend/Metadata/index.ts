import { AzureFunction, Context } from "@azure/functions"
import { Extension } from "../Models/extension";

const activityFunction: AzureFunction = async function (context: Context): Promise<string> {

    const extension: Extension = context.bindings.extension;

    context.log(`Metadata: ${extension.displayName}`);
    return `Hello ${extension.displayName}!`;
};

export default activityFunction;
