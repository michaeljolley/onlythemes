import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AzureCI } from "../Azure/azureCI";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const payload = req.body;

    if (payload) {
        const containerInstanceId: string = payload.containerInstanceId;

        if (containerInstanceId) {
            const azure = new AzureCI();
            await azure.destroyCI(containerInstanceId);
        }

        context.res = {
            status: containerInstanceId ? 200 : 404,
            body: containerInstanceId
        };
    }
};

export default httpTrigger;