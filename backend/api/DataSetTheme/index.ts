import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";
import { Theme } from "../Models/theme";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
    const { container } = await database.containers.createIfNotExists({ id: "themes" });

    const { resources } = await container.items
        .query({
            query: "SELECT c.id, c.name, c.extensionId, c.type, c.colors FROM c WHERE c.imageCaptured=true"
        })
        .fetchAll();

    const themes = resources.map((theme: Theme) => {
        return JSON.stringify({
            themeId: theme.id,
            type: theme.type === 'vs' ? 'light' : 'dark',
            editorBackground_H: theme.colors.editorBackground?.h || -1,
            editorBackground_S: theme.colors.editorBackground?.s || -1,
            editorBackground_L: theme.colors.editorBackground?.l || -1,
            editorForeground_H: theme.colors.editorForeground?.h || -1,
            editorForeground_S: theme.colors.editorForeground?.s || -1,
            editorForeground_L: theme.colors.editorForeground?.l || -1,
            activityBarBackground_H: theme.colors.activityBarBackground?.h || -1,
            activityBarBackground_S: theme.colors.activityBarBackground?.s || -1,
            activityBarBackground_L: theme.colors.activityBarBackground?.l || -1,
            foreground_H: theme.colors.foreground?.h || -1,
            foreground_S: theme.colors.foreground?.s || -1,
            foreground_L: theme.colors.foreground?.l || -1,
            activityBarForeground_H: theme.colors.activityBarForeground?.h || -1,
            activityBarForeground_S: theme.colors.activityBarForeground?.s || -1,
            activityBarForeground_L: theme.colors.activityBarForeground?.l || -1,
            sideBarBackground_H: theme.colors.sideBarBackground?.h || -1,
            sideBarBackground_S: theme.colors.sideBarBackground?.s || -1,
            sideBarBackground_L: theme.colors.sideBarBackground?.l || -1,
            sideBarForeground_H: theme.colors.sideBarForeground?.h || -1,
            sideBarForeground_S: theme.colors.sideBarForeground?.s || -1,
            sideBarForeground_L: theme.colors.sideBarForeground?.l || -1,
            editorGroupHeaderNoTabsBackground_H: theme.colors.editorGroupHeaderNoTabsBackground?.h || -1,
            editorGroupHeaderNoTabsBackground_S: theme.colors.editorGroupHeaderNoTabsBackground?.s || -1,
            editorGroupHeaderNoTabsBackground_L: theme.colors.editorGroupHeaderNoTabsBackground?.l || -1,
            editorGroupHeaderTabsBackground_H: theme.colors.editorGroupHeaderTabsBackground?.h || -1,
            editorGroupHeaderTabsBackground_S: theme.colors.editorGroupHeaderTabsBackground?.s || -1,
            editorGroupHeaderTabsBackground_L: theme.colors.editorGroupHeaderTabsBackground?.l || -1,
            statusBarBackground_H: theme.colors.statusBarBackground?.h || -1,
            statusBarBackground_S: theme.colors.statusBarBackground?.s || -1,
            statusBarBackground_L: theme.colors.statusBarBackground?.l || -1,
            statusBarForeground_H: theme.colors.statusBarForeground?.h || -1,
            statusBarForeground_S: theme.colors.statusBarForeground?.s || -1,
            statusBarForeground_L: theme.colors.statusBarForeground?.l || -1,
            titleBarActiveBackground_H: theme.colors.titleBarActiveBackground?.h || -1,
            titleBarActiveBackground_S: theme.colors.titleBarActiveBackground?.s || -1,
            titleBarActiveBackground_L: theme.colors.titleBarActiveBackground?.l || -1,
            titleBarActiveForeground_H: theme.colors.titleBarActiveForeground?.h || -1,
            titleBarActiveForeground_S: theme.colors.titleBarActiveForeground?.s || -1,
            titleBarActiveForeground_L: theme.colors.titleBarActiveForeground?.l || -1,
            buttonBackground_H: theme.colors.buttonBackground?.h || -1,
            buttonBackground_S: theme.colors.buttonBackground?.s || -1,
            buttonBackground_L: theme.colors.buttonBackground?.l || -1,
            buttonForeground_H: theme.colors.buttonForeground?.h || -1,
            buttonForeground_S: theme.colors.buttonForeground?.s || -1,
            buttonForeground_L: theme.colors.buttonForeground?.l || -1
        });
    }).join("\n");

    context.res = {
        status: 200,
        body: themes
    };
};

export default httpTrigger;