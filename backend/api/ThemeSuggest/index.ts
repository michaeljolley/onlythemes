import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Theme } from "../Models/theme";
import { Extension } from "../Models/extension";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const userId: string | undefined = req.query.userId;
  let theme: Theme | undefined;
  let extension: Extension | undefined;

  const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
  const { container } = await database.containers.createIfNotExists({ id: "themes" });
  const extensionContainer = await database.containers.createIfNotExists({ id: "extensions" });

  const sprocId = "getRandomTheme";

  const response = await container.scripts.storedProcedure(sprocId).execute(undefined);

  const { randomTheme } = response.resource;

  if (randomTheme) {

    // Lookup the themeId in CosmosDb
    const { resources } = await container.items
      .query({
        query: "SELECT * from c WHERE c.id = @themeId",
        parameters: [{ name: "@themeId", value: randomTheme.id }]
      })
      .fetchAll();

    theme = resources[0];

    const extensionResources = await extensionContainer.container.items
      .query({
        query: "SELECT * from c WHERE c.extensionId = @extensionId",
        parameters: [{ name: "@extensionId", value: theme.extensionId }]
      })
      .fetchAll();

    extension = extensionResources.resources[0];

    if (extension) {
      context.res = {
        status: 200,
        body: { theme, extension }
      };
    } else {
      context.res = {
        status: 404
      };
    }
  } else {
    context.res = {
      status: 404
    };
  }
};

export default httpTrigger;

/**
 * getRandomTheme SPROC
 */
// function getRandomTheme(continuationToken) {
//     var collection = getContext().getCollection();
//     var maxResult = 1000; // MAX number of docs to process in one batch, when reached, return to client/request continuation. 
//     // intentionally set low to demonstrate the concept. This can be much higher. Try experimenting.
//     // We've had it in to the high thousands before seeing the stored proceudre timing out.

//     // The number of documents counted.
//     var result = [];

//     tryQuery(continuationToken);

//     // Helper method to check for max result and call query.
//     function tryQuery(nextContinuationToken) {
//         var responseOptions = { continuation: nextContinuationToken, pageSize: maxResult };

//         // In case the server is running this script for long time/near timeout, it would return false,
//         // in this case we set the response to current continuation token, 
//         // and the client will run this script again starting from this continuation.
//         // When the client calls this script 1st time, is passes empty continuation token.
//         if (result.length >= maxResult || !query(responseOptions)) {
//             setBody(nextContinuationToken);
//         }
//     }

//     function query(responseOptions) {
//         const filterQuery = "select c.id from c where c.imageCaptured = true";
//         // For empty query string, use readDocuments rather than queryDocuments -- it's faster as doesn't need to process the query.
//         return (filterQuery && filterQuery.length) ?
//             collection.queryDocuments(collection.getSelfLink(), filterQuery, responseOptions, onReadDocuments) :
//             collection.readDocuments(collection.getSelfLink(), responseOptions, onReadDocuments);
//     }

//     //return random integer from range
//     function getRandomInt(min, max) {
//         return Math.floor(Math.random() * (max - min + 1)) + min;
//     }

//     // This is callback is called from collection.queryDocuments/readDocuments.
//     function onReadDocuments(err, docFeed, responseOptions) {
//         if (err) {
//             throw 'Error while reading document: ' + err;
//         }

//         //append all docFeed to results
//         docFeed.forEach(function (element) {
//             result.push(element);
//         });

//         // If there is continuation, call query again with it, 
//         // otherwise we are done, in which case set continuation to null.
//         if (responseOptions.continuation) {
//             tryQuery(responseOptions.continuation);
//         } else {
//             setBody(null);
//         }
//     }

//     // Set response body: use an object the client is expecting (2 properties: result and continuationToken).
//     function setBody(continuationToken) {
//         var randomIndex = getRandomInt(0, result.length - 1);
//         var body = { randomTheme: result[randomIndex], continuationToken: continuationToken };
//         getContext().getResponse().setBody(body);
//     }
// }