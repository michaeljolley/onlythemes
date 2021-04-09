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
            type: theme.type,
            editorBackground_H: theme.colors.editorBackground?.h,
            editorBackground_S: theme.colors.editorBackground?.s,
            editorBackground_L: theme.colors.editorBackground?.l,
            editorForeground_H: theme.colors.editorForeground?.h,
            editorForeground_S: theme.colors.editorForeground?.s,
            editorForeground_L: theme.colors.editorForeground?.l,
            activityBarBackground_H: theme.colors.activityBarBackground?.h,
            activityBarBackground_S: theme.colors.activityBarBackground?.s,
            activityBarBackground_L: theme.colors.activityBarBackground?.l,
            foreground_H: theme.colors.foreground?.h,
            foreground_S: theme.colors.foreground?.s,
            foreground_L: theme.colors.foreground?.l,
            activityBarForeground_H: theme.colors.activityBarForeground?.h,
            activityBarForeground_S: theme.colors.activityBarForeground?.s,
            activityBarForeground_L: theme.colors.activityBarForeground?.l,
            sideBarBackground_H: theme.colors.sideBarBackground?.h,
            sideBarBackground_S: theme.colors.sideBarBackground?.s,
            sideBarBackground_L: theme.colors.sideBarBackground?.l,
            sideBarForeground_H: theme.colors.sideBarForeground?.h,
            sideBarForeground_S: theme.colors.sideBarForeground?.s,
            sideBarForeground_L: theme.colors.sideBarForeground?.l,
            editorGroupHeaderNoTabsBackground_H: theme.colors.editorGroupHeaderNoTabsBackground?.h,
            editorGroupHeaderNoTabsBackground_S: theme.colors.editorGroupHeaderNoTabsBackground?.s,
            editorGroupHeaderNoTabsBackground_L: theme.colors.editorGroupHeaderNoTabsBackground?.l,
            editorGroupHeaderTabsBackground_H: theme.colors.editorGroupHeaderTabsBackground?.h,
            editorGroupHeaderTabsBackground_S: theme.colors.editorGroupHeaderTabsBackground?.s,
            editorGroupHeaderTabsBackground_L: theme.colors.editorGroupHeaderTabsBackground?.l,
            statusBarBackground_H: theme.colors.statusBarBackground?.h,
            statusBarBackground_S: theme.colors.statusBarBackground?.s,
            statusBarBackground_L: theme.colors.statusBarBackground?.l,
            statusBarForeground_H: theme.colors.statusBarForeground?.h,
            statusBarForeground_S: theme.colors.statusBarForeground?.s,
            statusBarForeground_L: theme.colors.statusBarForeground?.l,
            titleBarActiveBackground_H: theme.colors.titleBarActiveBackground?.h,
            titleBarActiveBackground_S: theme.colors.titleBarActiveBackground?.s,
            titleBarActiveBackground_L: theme.colors.titleBarActiveBackground?.l,
            titleBarActiveForeground_H: theme.colors.titleBarActiveForeground?.h,
            titleBarActiveForeground_S: theme.colors.titleBarActiveForeground?.s,
            titleBarActiveForeground_L: theme.colors.titleBarActiveForeground?.l,
            buttonBackground_H: theme.colors.buttonBackground?.h,
            buttonBackground_S: theme.colors.buttonBackground?.s,
            buttonBackground_L: theme.colors.buttonBackground?.l,
            buttonForeground_H: theme.colors.buttonForeground?.h,
            buttonForeground_S: theme.colors.buttonForeground?.s,
            buttonForeground_L: theme.colors.buttonForeground?.l
        });
    }).join("\n");

    context.res = {
        status: 200,
        body: themes
    };
};

export default httpTrigger;