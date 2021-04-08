import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";
import { Rating } from "../Models/rating";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
    const { container } = await database.containers.createIfNotExists({ id: "ratings" });

    const { resources } = await container.items
        .query({
            query: "SELECT * from c"
        })
        .fetchAll();

    const ratings = resources.map((rating: Rating) => JSON.stringify({
        userId: rating.userId,
        themeId: rating.themeId,
        rating: rating.rating
    })).join("\n");

    context.res = {
        status: 200,
        body: ratings
    };
};

export default httpTrigger;