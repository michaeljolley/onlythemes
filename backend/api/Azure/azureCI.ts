import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import {
  ContainerInstanceManagementClient,
  ContainerInstanceManagementModels
} from "@azure/arm-containerinstance";
import * as uuid from 'uuid';

export class AzureCI {

  private clientId = process.env["servicePrincipalClientId"];
  private secret = process.env["servicePrincipalSecret"];
  private tenantId = process.env["servicePrincipalTenantId"];
  private subscriptionId = process.env["servicePrincipalSubscriptionId"];

  private storageAccountName = process.env["storageAccountName"];
  private storageAccountKey = process.env["storageAccountKey"];

  private registryServer = process.env["registryServer"];
  private registryUsername = process.env["registryUsername"];
  private registryPassword = process.env["registryPassword"];
  private uid = uuid.v4();

  private containerDeploymentResult: ContainerInstanceManagementModels.ContainerGroupsCreateOrUpdateResponse;

  /**
   * Creates an Azure container instance that runs VS Code 
   * with the provided extension and theme name.
   * @param extensionId The extension to install
   * @param theme The theme that exists within the extension to screenshot
   */
  createCI = async (extensionId: string, theme: string): Promise<ContainerInstanceManagementModels.ContainerGroupsCreateOrUpdateResponse | undefined> => {

    const { credentials } = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(this.clientId, this.secret, this.tenantId);

    const client = new ContainerInstanceManagementClient(credentials, this.subscriptionId);

    const containerGroupInstance: ContainerInstanceManagementModels.ContainerGroup = {
      "location": 'east us',
      "containers": [
        {
          "name": this.uid,
          "environmentVariables": [
            {
              "name": "EXTENSION",
              "value": extensionId
            },
            {
              "name": "THEME",
              "value": theme
            },
            {
              "name": "CONTAINER_INSTANCE",
              "value": this.uid
            }
          ],
          "image": `${this.registryServer}/code-server:latest`,
          "ports": [{
            "protocol": 'TCP',
            "port": 8080,
          }],
          "resources": {
            "requests": {
              "cpu": 1,
              "memoryInGB": 1.5
            }
          },
          "volumeMounts": [
            {
              "name": 'imagesfileshare',
              "mountPath": '/images'
            }
          ]
        }
      ],
      "imageRegistryCredentials": [{ "server": this.registryServer, "username": this.registryUsername, "password": this.registryPassword }],
      "osType": 'Linux',
      "ipAddress": {
        "ports": [{
          "port": 8080,
          "protocol": 'TCP'
        }],
        "type": "Public",
        "dnsNameLabel": this.uid
      },
      "volumes": [
        {
          "name": 'imagesfileshare',
          "azureFile": {
            "shareName": 'extension-images',
            "storageAccountName": this.storageAccountName,
            "storageAccountKey": this.storageAccountKey
          }
        }
      ],
      "restartPolicy": 'Never',
      "type": "Microsoft.ContainerInstance/containerGroups",
      "name": this.uid
    }

    this.containerDeploymentResult = await client.containerGroups.createOrUpdate('OnlyThemesRG', this.uid, containerGroupInstance);
    if (this.containerDeploymentResult.provisioningState == "Succeeded") {
      let appUrlWithoutPort = this.containerDeploymentResult.ipAddress?.fqdn;
      let appUrl = `http://${appUrlWithoutPort}/`;
      console.log("Your App has been deployed at: " + appUrl);
    } else {
      return undefined;
    }

    return this.containerDeploymentResult;
  }

  /**
   * Deletes an Azure container instance group
   * @param instanceId Id of the Azure container instance group to destroy
   */
  destroyCI = async (instanceId: string): Promise<void> => {

    const { credentials } = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(this.clientId, this.secret, this.tenantId);

    const client = new ContainerInstanceManagementClient(credentials, this.subscriptionId);

    await client.containerGroups.deleteMethod('OnlyThemesRG', instanceId)
  }
}