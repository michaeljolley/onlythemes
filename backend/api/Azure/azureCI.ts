import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import {
  ContainerInstanceManagementClient,
  ContainerInstanceManagementModels
} from "@azure/arm-containerinstance";
import * as uuid from 'uuid';
import { ContainerGroupsListResponse } from "@azure/arm-containerinstance/esm/models";

export class AzureCI {

  private clientId = process.env["servicePrincipalClientId"];
  private secret = process.env["servicePrincipalSecret"];
  private tenantId = process.env["servicePrincipalTenantId"];
  private subscriptionId = process.env["servicePrincipalSubscriptionId"];
  private functionsUrl = process.env["functionsUrl"];

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
   * @param extensionName The extension to install
   */
  createCI = async (extensionName: string, extensionId: string): Promise<ContainerInstanceManagementModels.ContainerGroupsCreateOrUpdateResponse | undefined> => {

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
              "value": extensionName
            },
            {
              "name": "EXTENSION_ID",
              "value": extensionId
            },
            {
              "name": "CONTAINER_INSTANCE",
              "value": this.uid
            },
            {
              "name": "FUNCTIONS_URL",
              "value": this.functionsUrl
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

  cleanCI = async (): Promise<void> => {

    const { credentials } = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(this.clientId, this.secret, this.tenantId);
    const client = new ContainerInstanceManagementClient(credentials, this.subscriptionId);

    const containerGroupList: ContainerGroupsListResponse = await client.containerGroups.list();

    const failedContainerGroups = containerGroupList.filter(f => f.provisioningState === 'Failed');

    for (const containerGroup of failedContainerGroups) {
      await this.destroyCI(containerGroup.name);
    }
  }
}