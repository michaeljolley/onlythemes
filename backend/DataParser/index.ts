import { AzureFunction, Context } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Extension } from "../Models/extension";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const activityFunction: AzureFunction = async function (context: Context): Promise<boolean> {

    const extension: Extension = context.bindings.extension;

    context.log(`DataParser: ${extension.displayName}`);

    if (extension) {
        const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
        const { container } = await database.containers.createIfNotExists({ id: "extensions" });
        const { resource } = await container.items.upsert(extension);
        return true;
    }

    return false;
};

export default activityFunction;
