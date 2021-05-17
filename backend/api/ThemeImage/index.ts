import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ShareServiceClient, StorageSharedKeyCredential } from "@azure/storage-file-share";

const account = process.env.storageAccountName;
const accountKey = process.env.storageAccountKey;
const shareName = "extension-images";

const credential = new StorageSharedKeyCredential(account, accountKey);
const serviceClient = new ShareServiceClient(
  `https://onlythemesstorage.file.core.windows.net`,
  credential
);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const themeId: string | undefined = req.query.themeId;
  const lang: string | undefined = req.query.lang;

  let fileName = `${themeId}.png`;
  if(lang != undefined){
    fileName = `${themeId}.${lang}.png`;
  }

  try {

    const fileExists = await serviceClient
      .getShareClient(shareName)
      .rootDirectoryClient.getFileClient(fileName).exists();

    if (fileExists) {
      // Go get the image out of Azure file share
      const fileBuffer = await getFile(fileName);

      // Send it back as if hosted
      context.res = {
        status: 202,
        body: fileBuffer,
        headers: { "Content-Disposition": "inline" }
      };
      context.done();
    }
    else {
      context.res = {
        status: 404
      };
    }
  }
  catch (err) {
    context.res = {
      status: 500
    };
  }

};

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

const getFile = async (fileName) => {

  const fileClient = serviceClient
    .getShareClient(shareName)
    .rootDirectoryClient.getFileClient(fileName);

  const downloadFileResponse = await fileClient.download();

  return await streamToBuffer(downloadFileResponse.readableStreamBody)
}

export default httpTrigger;