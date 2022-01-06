import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { PokemonInfo } from "../../types/pokemon"
import { pokeInfo } from ".";
import axios from "axios";

let pokemon: string[] = []

export default class Pokemon extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "pokemon",
            category: "Pokemon",
            description: "Commands that are related to Pokémon.",
            subcommands: {
                pokeinfo: {
                    description: "See information about a Pokémon.",
                    args: [
                        {
                            name: "name",
                            description: "The Pokémon to lookup.",
                            type: "STRING",
                            required: true,
                            autocomplete: true
                        }
                    ],
                    isAutocomplete: true,
                    autocomplete: async ({ client, interaction }) => {
                        const focusedValue = interaction.options.getFocused() as string
                        const choices = await fetchAllPokemon()
                        const filtered = choices.filter((choice) =>
                            choice.toLowerCase().startsWith(focusedValue.toLowerCase())
                        );
                        await interaction.respond(
                            filtered.slice(0, Math.min(25, filtered.length)).map((choice) => ({
                                name: client.utils.titleCase(choice),
                                value: client.utils.titleCase(choice)
                            }))
                        );
                    },
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction)
                        await pokeInfo(client, interaction)
                    }
                }
            }
        });
    }
}

const fetchAllPokemon = async () => {
    if (pokemon.length) return pokemon

    const resp = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1118")
    pokemon = resp.data.results.map((poke: PokemonInfo) => poke.name)

    return pokemon
}