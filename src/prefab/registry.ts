import * as fs from "fs/promises";
import * as path from "path";
import { KelleeBotCommand } from "../util/command";
import { Dirent } from "fs";
import { KelleeBotClient } from "./client";

export const registerCommands = async (client: KelleeBotClient, ...dirs: string[]) => {
    for (const dir of dirs) {
        const files = await fs.readdir(path.join(__dirname, dir));

        for (let file of files) {
            const stat = await fs.lstat(path.join(__dirname, dir, file));

            if (file.includes("-ignore")) continue;

            if (stat.isDirectory()) await registerCommands(client, path.join(dir, file));
            else {
                if (file.endsWith(".js")) {
                    try {
                        const cmdModule: KelleeBotCommand = new (await import(path.join(__dirname, dir, file))).default(client);

                        const { name, category, hideCommand, isAutocomplete, autocomplete } = cmdModule;

                        if (!name) {
                            client.utils.log("WARNING", `${__filename}`, `The command '${path.join(__dirname, dir, file)}' doesn't have a name`);
                            continue;
                        }

                        if (client.commands.has(name)) {
                            client.utils.log(
                                "WARNING",
                                `${__filename}`,
                                `The command (slash) name '${name}' (${path.join(__dirname, dir, file)}) has already been added.`
                            );
                            continue;
                        }

                        if (cmdModule.development) {
                            const server = client.config.TEST_SERVERS[0];

                            if (!server) {
                                client.utils.log(
                                    "WARNING",
                                    `${__filename}`,
                                    "To add a development only slash command, you need to have at least one test server."
                                );
                                continue;
                            }
                        }

                        client.commands.set(name, cmdModule);

                        if (hideCommand) continue;

                        if (isAutocomplete) {
                            if (!autocomplete) {
                                client.utils.log(
                                    "WARNING",
                                    `${__filename}`,
                                    `The command '${name}' doesn't have an autocomplete callback. This is required as isAutocomplete is true.`
                                );
                                continue;
                            }
                        }

                        if (category) {
                            let commands = client.categories.get(category.toLowerCase());
                            if (!commands) commands = [category];
                            commands.push(name);
                            client.categories.set(category.toLowerCase(), commands);
                        } else {
                            client.utils.log(
                                "WARNING",
                                `${__filename}`,
                                `The command '${name}' doesn't have a category, it will default to 'No category'.`
                            );
                            let commands = client.categories.get("no category");
                            if (!commands) commands = ["No category"];
                            commands.push(name);
                            client.categories.set("no category", commands);
                        }
                    } catch (e: any) {
                        client.utils.log("ERROR", `${__filename}`, `Error loading commands: ${e.message}`);
                    }
                }
            }
        }
    }
};

export const registerEvents = async (client: KelleeBotClient, ...dirs: string[]) => {
    for (const dir of dirs) {
        const files = await fs.readdir(path.join(__dirname, dir));

        for (let file of files) {
            const stat = await fs.lstat(path.join(__dirname, dir, file));

            if (stat.isDirectory()) await registerEvents(client, path.join(dir, file));
            else {
                if (file.endsWith(".js")) {
                    const eventName = file.substring(0, file.indexOf(".js"));
                    try {
                        const eventModule = (await import(path.join(__dirname, dir, file))).default;
                        client.on(eventName, eventModule.bind(null, client));
                    } catch (e: any) {
                        client.utils.log("ERROR", `${__filename}`, `Error loading events: ${e.message}`);
                    }
                }
            }
        }
    }
};

export const registerFeatures = async (client: KelleeBotClient, dir: string) => {
    for (const [file, fileName] of await getAllFiles(path.join(__dirname, dir))) {
        registerFeature(client, await import(file), fileName);
    }
};

const registerFeature = (client: KelleeBotClient, file: any, fileName: string) => {
    const { default: func, config } = file;
    if (typeof func !== "function") return;
    func(client);
};

const getAllFiles = async (dir: string) => {
    const files: Dirent[] = await fs.readdir(dir, { withFileTypes: true });
    let jsFiles: [string, string][] = [];

    for (const file of files) {
        if (file.isDirectory()) {
            jsFiles = [...jsFiles, ...(await getAllFiles(`${dir}/${file.name}`))];
        } else if (file.name.endsWith(".js")) {
            let fileName: string | string[] = file.name.replace(/\\/g, "/").split("/");
            fileName = fileName[fileName.length - 1];
            fileName = fileName.split(".")[0].toLowerCase();
            jsFiles.push([`${dir}/${file.name}`, fileName]);
        }
    }
    return jsFiles;
};
