/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 * 
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your 
 *    function app in Kudu
 */

import * as df from "durable-functions"

const orchestrator = df.orchestrator(function* (context) {
    const outputs = [];

    // Run another function or something that determines:
    // Do we have this theme already?
    // If so, has it been updated since we last loaded, load it
    // If not, load it
    const shouldProcess = yield context.df.callActivity('ProcessGate', 'extension');

    outputs.push(shouldProcess);

    if (shouldProcess) {
        // Replace "Hello" with the name of your Durable Activity Function.
        outputs.push(yield context.df.callActivity("Hello", "Tokyo"));   // Load extension to database
        outputs.push(yield context.df.callActivity("Hello", "Seattle")); // Create screenshot and save to storage
        outputs.push(yield context.df.callActivity("Hello", "London"));  // Get & load metadata about extension (i.e. color pallette)
    }

    // returns [{}, {}, {}, {}]
    return outputs;
});

export default orchestrator;
