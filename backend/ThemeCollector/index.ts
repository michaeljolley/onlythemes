import * as df from "durable-functions"
import { Extension } from "../Models/extension";

const orchestrator = df.orchestrator(function* (context) {
    const outputs = [];

    const extension = context.df.getInput() as Extension;

    //const shouldProcess = yield context.df.callActivity('ProcessGate', 'extension');

    //outputs.push(shouldProcess);

    //if (shouldProcess) {
    // Replace "Hello" with the name of your Durable Activity Function.
    outputs.push(yield context.df.callActivity("DataParser", extension));   // Load extension to database
    outputs.push(yield context.df.callActivity("ImageProcessor", extension)); // Create screenshot and save to storage
    outputs.push(yield context.df.callActivity("Metadata", extension));  // Get & load metadata about extension (i.e. color pallette)
    //}

    // returns [{}, {}, {}, {}]
    return outputs;
});

export default orchestrator;
