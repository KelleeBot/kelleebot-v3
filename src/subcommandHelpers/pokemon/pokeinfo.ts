import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { MessageEmbed } from "discord.js";
import { PokemonInfo } from "../../types/pokemon";

const embedColor: any = {
    normal: 0x9b9b6b,
    fire: 0xe5711e,
    water: 0x4c7bed,
    electric: 0xf2c617,
    grass: 0x69b741,
    ice: 0x7fcece,
    fighting: 0xaf2c25,
    poison: 0x8e398e,
    ground: 0xd9b34a,
    flying: 0x9c88da,
    psychic: 0xf7356f,
    bug: 0x9ba91e,
    rock: 0xa48f32,
    ghost: 0x634e86,
    dragon: 0x6124f5,
    dark: 0x5e493c,
    style: 0xa6a6c4,
    fairy: 0xe484e4
};

export const pokeInfo = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const pokemonName = interaction.options.getString("name")!
        const data = await fetchPokemonName(pokemonName)

        const msgEmbed = createPokemonEmbed(client, data)
        return interaction.editReply({ embeds: [msgEmbed] })

    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "An error has occurred. Please try again."
        });
    }
}

const fetchPokemonName = async (name: string) => {
    const resp = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(
            name.toLowerCase()
        )}`
    );
    return resp.data
};

const createPokemonEmbed = (client: Client, data: PokemonInfo) => {
    const height = data.height * 10;
    const weight = data.weight / 10;

    return new MessageEmbed()
        .setAuthor({
            name: `#${data.id} - ${client.utils.titleCase(data.name)}`,
            iconURL: "http://pngimg.com/uploads/pokemon_logo/pokemon_logo_PNG12.png"
        })
        .setColor(embedColor[data.types[0].type.name])
        .setThumbnail(data.sprites.other["official-artwork"].front_default)
        .addFields(
            {
                name: "**Height**",
                value: `${toFeet(height)} (${height}cm)`,
                inline: true
            },
            {
                name: "**Weight**",
                value: `${kgToLbs(weight)} (${weight}kg)`,
                inline: true
            },
            {
                name: data.types.length > 1 ? "**Types**" : "**Type**",
                value: data.types
                    .map((t: { type: { name: string } }) => client.utils.titleCase(t.type.name))
                    .join(", "),
                inline: true
            },
            {
                name: `**Abilities [${data.abilities.length}]**`,
                value: data.abilities
                    .map((a: { ability: { name: string } }) => client.utils.titleCase(a.ability.name))
                    .join(", "),
                inline: true
            },
            {
                name: `**Stats**`,
                value: data.stats
                    .map(
                        (s: { stat: { name: string }; base_stat: any }) =>
                            `${client.utils.titleCase(s.stat.name)} [${s.base_stat}]`
                    )
                    .join(", "),
                inline: true
            },
            {
                name: `**Moves [${data.moves.length}]**`,
                value: data.moves.length
                    ? data.moves
                        .map((m: { move: { name: string } }) => client.utils.titleCase(m.move.name))
                        .slice(0, 5)
                        .join(", ")
                    : "None",
                inline: true
            }
        )
        .setFooter({
            text: "Powered by PokéAPI",
            iconURL:
                "https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi_256.png"
        });
};

const toFeet = (number: number): string => {
    const realFeet = (number * 0.3937) / 12;
    const feet = Math.floor(realFeet);
    const inches = Math.round((realFeet - feet) * 12);
    return `${feet}ft ${inches}in`;
};

const kgToLbs = (pK: number): string => {
    const nearExact = pK / 0.45359237;
    const lbs = Math.floor(nearExact);
    return `${lbs}lbs`;
};