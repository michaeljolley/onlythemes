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

  private registryServer = process.env["registryServer"];
  private registryUsername = process.env["registryUsername"];
  private registryPassword = process.env["registryPassword"];
  private uid = uuid.v4();

  private containerDeploymentResult: ContainerInstanceManagementModels.ContainerGroupsCreateOrUpdateResponse;

  createCI = async (extensionId: string, extensionName: string): Promise<ContainerInstanceManagementModels.ContainerGroupsCreateOrUpdateResponse | undefined> => {

    const { credentials } = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(this.clientId, this.secret, this.tenantId);

    const client = new ContainerInstanceManagementClient(credentials, this.subscriptionId);

    const containerGroupInstance: ContainerInstanceManagementModels.ContainerGroup = {
      "location": 'east us',
      "containers": [
        {
          "name": this.uid,
          // "command": taskParams.commandLine,
          "environmentVariables": [
            {
              "name": "EXTENSION_ID",
              "value": extensionId
            },
            {
              "name": "EXTENSION_NAME",
              "value": extensionName
            }
          ],
          "image": `${this.registryServer}/code-server:latest`,
          "ports": [{
            "protocol": 'TCP',
            "port": 80,
          }],
          "resources": {
            "requests": {
              "cpu": 1,
              "memoryInGB": 1.5
            }
          },
          "volumeMounts": []
        }
      ],
      "imageRegistryCredentials": [{ "server": this.registryServer, "username": this.registryUsername, "password": this.registryPassword }],
      "osType": 'Linux',
      "ipAddress": {
        "ports": [{
          "port": 80,
          "protocol": 'TCP'
        }],
        "type": "Public",
        "dnsNameLabel": this.uid
      },
      "restartPolicy": 'Always',
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
}