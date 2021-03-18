import * as df from "durable-functions"
import { Extension } from "../Models/extension";

const orchestrator = df.orchestrator(function* (context) {

    const extension = context.df.getInput() as Extension;

    // Create screenshot and save to storage
    const imageData = yield context.df.callActivity("ImageProcessor", extension);

    // Get & load metadata about extension (i.e. color pallette)
    const metaData = yield context.df.callActivity("Metadata", extension);

    if (imageData && metaData) {
        // Load extension to database
        extension.imageData = imageData;
        extension.metaData = metaData;
        yield context.df.callActivity("DataParser", extension);
    }
});

export default orchestrator;
