import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { pokeInfo, quiz } from "../../subcommandHelpers/pokemon";

export default class Pokemon extends KelleeBotCommand {
	constructor(client: Client) {
		super(client, {
			name: "pokemon",
			category: "Pokemon",
			description: "Commands that are related to Pokémon.",
			cooldown: 15,
			clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
			subcommands: {
				pokeinfo: {
					description: "See information about a Pokémon.",
					options: [
						{
							name: "name",
							description: "The Pokémon to lookup.",
							type: Constants.ApplicationCommandOptionTypes.STRING,
							required: true,
							autocomplete: true
						}
					],
					isAutocomplete: true,
					autocomplete: async ({ client, interaction }) => {
						await client.utils.getAutocomplete(interaction, client.pokemon);
					},
					execute: async ({ client, interaction }) => {
						await this.setCooldown(interaction);
						await pokeInfo(client, interaction);
					}
				},
				quiz: {
					description: "Guess that Pokémon.",
					execute: async ({ client, interaction }) => {
						await this.setCooldown(interaction);
						await quiz(client, interaction);
					}
				}
			}
		});
	}
}
