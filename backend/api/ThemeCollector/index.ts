import * as df from "durable-functions"
import { Extension } from "../Models/extension";
import { Manifest } from "../Models/manifest";
import { Theme } from "../Models/theme";

const orchestrator = df.orchestrator(function* (context) {

    const payload = context.df.getInput() as any;
    const extension: Extension = payload.extension;
    const theme: Theme = payload.theme;
    const manifest: Manifest = payload.manifest;

    // Create screenshot and save to storage
    const imageData = yield context.df.callActivity("ImageProcessor", { extension, theme });

    // Get & load metadata about extension (i.e. color pallette)
    const metaData = yield context.df.callActivity("Metadata", { extension, theme, manifest });

    if (imageData && metaData) {
        // Load extension to database
        extension.imageData = imageData;
        extension.metaData = metaData;
        yield context.df.callActivity("DataParser", extension);
    }
});

export default orchestrator;
