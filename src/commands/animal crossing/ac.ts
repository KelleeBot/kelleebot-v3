import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { artwork, bug, clothing, diy, fish, furniture, interior, items, photo, sea, tool, villager } from "../../subcommandHelpers/animal crossing";
import * as AC from "../../types/animalCrossing";
import axios from "axios";

let artworks: string[] = [];
let bugs: string[] = [];
let clothings: string[] = [];
let diys: string[] = [];
let fishes: string[] = [];
let furnitures: string[] = [];
let interiors: string[] = [];
let item: string[] = [];
let photos: string[] = [];
let seaCreatures: string[] = [];
let tools: string[] = [];
let villagers: string[] = [];

export default class AnimalCrossing extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "ac",
            category: "Animal Crossing",
            description: "All commands that are related to Animal Crossing.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                artwork: {
                    description: "Retrieve information about a specific artwork in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "artwork",
                            description: "The name of the artwork you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/art", "artworks");
                        await client.utils.getAutocomplete(client, interaction, choices);

                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await artwork(client, interaction);
                    }
                },
                bug: {
                    description: "Retrieve information about a specific bug in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "bug",
                            description: "The name of the bug you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/bugs", "bugs");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await bug(client, interaction);
                    }
                },
                clothing: {
                    description: "Retrieve information about a specific clothing item in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "clothing",
                            description: "The name of the clothing you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/clothing", "clothing");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await clothing(client, interaction);
                    }
                },
                diy: {
                    description: "Retrieve information about a specific diy/recipe in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "diy",
                            description: "The name of the item you wish to retrieve recipe information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/recipes", "diys");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await diy(client, interaction);
                    }
                },
                dream: {
                    description: "Show's the server owner's ACNH dream address, if they have one set.",
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        const guildInfo = await client.guildInfo.get(interaction.guildId!);
                        if (!guildInfo.dreamAddress)
                            return interaction.reply({ content: "Looks like the server owner has not set their dream address yet." });

                        const owner = await interaction.guild?.fetchOwner();
                        return interaction.reply({ content: `${owner?.user.username}'s ACNH dream address is ${guildInfo.dreamAddress}.` });
                    }
                },
                fish: {
                    description: "Retrieve information about a specific fish in Animal Crossing: New Horizons",
                    options: [
                        {
                            name: "fish",
                            description: "The name of the fish you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/fish", "fishes");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await fish(client, interaction);
                    }
                },
                furniture: {
                    description: "Retrieve information about a specific furniture in Animal Crossing: New Horizons",
                    options: [
                        {
                            name: "furniture",
                            description: "The name of the furniture you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/furniture", "furnitures");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await furniture(client, interaction);
                    }
                },
                interior: {
                    description: "Retrieve information about a specific interior item in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "interior",
                            description: "The name of the interior item you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/interior", "interiors");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await interior(client, interaction);
                    }
                },
                item: {
                    description: "Retrieve information about a miscellaneous item in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "item",
                            description: "The name of the item you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/items", "items");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await items(client, interaction);
                    }
                },
                photo: {
                    description: "Retrieve information about a character photo or poster in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "photo",
                            description: "The name of the photo or poster you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/photos", "photos");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await photo(client, interaction);
                    }
                },
                sea: {
                    description: "Retrieve information about a specific sea creature in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "creature",
                            description: "The name of the sea creature you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/sea", "seaCreatures");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await sea(client, interaction);
                    }
                },
                tool: {
                    description: "Retrieve information about a specific tool in Animal Crossing: New Horizons.",
                    options: [
                        {
                            name: "tool",
                            description: "The name of the tool item you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/nh/tools", "tools");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await tool(client, interaction);
                    }
                },
                villager: {
                    description: "Retrieve information about a specific villager in any Animal Crossing game.",
                    options: [
                        {
                            name: "name",
                            description: "The name of the villager you wish to retrieve information about.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const choices = await fetchData("https://api.nookipedia.com/villagers", "villagers");
                        await client.utils.getAutocomplete(client, interaction, choices);
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await villager(client, interaction);
                    }
                }
            }
        });
    }
};

const fetchData = async (url: string, arrayType: "artworks" | "bugs" | "clothing" | "diys" | "fishes" | "furnitures" | "interiors" | "items" | "photos" | "seaCreatures" | "tools" | "villagers") => {
    if (arrayType === "artworks") {
        if (artworks.length) return artworks;
    } else if (arrayType === "bugs") {
        if (bugs.length) return bugs;
    } else if (arrayType === "clothing") {
        if (clothings.length) return clothings;
    } else if (arrayType === "diys") {
        if (diys.length) return diys;
    } else if (arrayType === "fishes") {
        if (fishes.length) return fishes;
    } else if (arrayType === "furnitures") {
        if (furnitures.length) return furnitures;
    } else if (arrayType === "interiors") {
        if (interiors.length) return interiors;
    } else if (arrayType === "items") {
        if (item.length) return item;
    } else if (arrayType === "photos") {
        if (photos.length) return photos;
    } else if (arrayType === "seaCreatures") {
        if (seaCreatures.length) return seaCreatures;
    } else if (arrayType === "tools") {
        if (tools.length) return tools;
    } else {
        if (villagers.length) return villagers;
    }

    const resp = await axios.get(url, {
        headers: {
            "X-API-KEY": `${process.env.NOOK_API_KEY}`,
            "Accept-Version": "2.0.0"
        }
    });
    const { data } = resp;

    if (arrayType === "artworks") {
        artworks = data.map((art: AC.Artwork) => art.name);
        return artworks;
    } else if (arrayType === "bugs") {
        bugs = data.map((bug: AC.Bug) => bug.name);
        return bugs;
    } else if (arrayType === "clothing") {
        clothings = data.map((clothing: AC.Clothing) => clothing.name);
        return clothings;
    } else if (arrayType === "diys") {
        diys = data.map((diy: AC.Recipe) => diy.name);
        return diys;
    } else if (arrayType === "fishes") {
        fishes = data.map((fish: AC.Fish) => fish.name);
        return fishes;
    } else if (arrayType === "furnitures") {
        furnitures = data.map((furniture: AC.Furniture) => furniture.name);
        return furnitures;
    } else if (arrayType === "interiors") {
        interiors = data.map((interior: AC.Interior) => interior.name);
        return interiors;
    } else if (arrayType === "items") {
        item = data.map((item: AC.Item) => item.name);
        return item;
    } else if (arrayType === "photos") {
        photos = data.map((photo: AC.Photo) => photo.name);
        return photos;
    } else if (arrayType === "seaCreatures") {
        seaCreatures = data.map((seaCreature: AC.Sea) => seaCreature.name);
        return seaCreatures;
    } else if (arrayType === "tools") {
        tools = data.map((tool: AC.Tool) => tool.name);
        return tools;
    } else {
        villagers = data.map((villager: AC.Villagers) => villager.name)
        return villagers;
    }
};