import { Mastra, type WorkflowResult, type Step, type ApiRoute } from "@mastra/core";
import { IMastraLogger } from "@mastra/core/logger";
import type { z } from "zod";
import { registerApiRoute } from "../mastra/inngest";
import { OAuth2Client } from "@badgateway/oauth2-client";
import { google } from "googleapis";
import { format } from "node:util";
import { getToken, setToken } from "../utils/tokenStore";
import { getLastExecutionTime, setLastExecutionTime } from "../utils/lastExecution";

async function getClient() {
    const client = new OAuth2Client({
        server: "https://raindrop.io",
        clientId: process.env.RAINDROP_CLIENT_ID,
        clientSecret: process.env.RAINDROP_CLIENT_SECRET,
        tokenEndpoint: "/oauth/access_token",
        authorizationEndpoint: "/oauth/authorize",
    });

    const token = getToken();
    if (token) {
        client.setToken(token);
    }

    return client;
}

async function getRaindrops(client: OAuth2Client) {
    try {
        const token = await client.getToken();
        const lastExecution = getLastExecutionTime();
        const response = await fetch(`https://api.raindrop.io/rest/v1/raindrops/0?search=created:>${lastExecution.toISOString()}`, {
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
        });
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error("Error fetching raindrops:", error);
        return [];
    }
}

async function getCollections(client: OAuth2Client) {
    try {
        const token = await client.getToken();
        const response = await fetch("https://api.raindrop.io/rest/v1/collections", {
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
        });
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
    }
}

async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    return sheets;
}

async function createSpreadsheet(sheets: any, title: string) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    if (res.data) {
        return process.env.GOOGLE_SHEET_ID;
    }

    const resource = {
        properties: {
            title,
        },
    };
    const spreadsheet = await sheets.spreadsheets.create({
        resource,
        fields: "spreadsheetId",
    });
    return spreadsheet.data.spreadsheetId;
}

async function addDataToSpreadsheet(sheets: any, spreadsheetId: string, data: any[][]) {
    const resource = {
        values: data,
    };
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1",
        valueInputOption: "RAW",
        resource,
    });
}

async function handleWebhook(mastra: Mastra) {
    const logger = mastra.getLogger();
    try {
        const raindropClient = await getClient();
        const raindrops = await getRaindrops(raindropClient);
        if (raindrops.length > 0) {
            const collections = await getCollections(raindropClient);
            const collectionMap = new Map(collections.map((c: any) => [c._id, c.title]));
            const sheets = await getGoogleSheetsClient();
            const spreadsheetId = await createSpreadsheet(sheets, "Raindrop.io");
            const data = [
                ["DATE", "PROJECT", "TASK"],
                ...(raindrops.map((raindrop: any) => [
                    raindrop.created,
                    collectionMap.get(raindrop.collection?.$id),
                    raindrop.title,
                ])),
            ];
            await addDataToSpreadsheet(sheets, spreadsheetId, data);
        }
        setLastExecutionTime();
    } catch (error) {
        logger?.error("Error handling Raindrop webhook", {
            error: format(error),
        });
    }
}

export function registerRaindropTrigger(): Array<ApiRoute> {
    return [
        registerApiRoute("/webhooks/raindrop", {
            method: "POST",
            handler: async (c) => {
                const mastra = c.get("mastra");
                await handleWebhook(mastra);
                return c.text("OK", 200);
            },
        }),
        registerApiRoute("/oauth/callback", {
            method: "GET",
            handler: async (c) => {
                const mastra = c.get("mastra");
                const logger = mastra.getLogger();
                try {
                    const client = await getClient();
                    const token = await client.getToken(c.req.url);
                    setToken(token);
                    return c.text("OK", 200);
                } catch (error) {
                    logger?.error("Error handling OAuth2 callback", {
                        error: format(error),
                    });
                    return c.text("Internal Server Error", 500);
                }
            },
        }),
    ];
}
