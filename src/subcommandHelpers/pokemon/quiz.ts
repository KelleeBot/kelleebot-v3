import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { MessageEmbed } from "discord.js";

export const quiz = async (client: Client, interaction: CommandInteraction) => {
    try {
        const pokemon = client.utils.randomRange(1, 890);
        const question = `https://cdn.dagpi.xyz/wtp/pokemon/${pokemon}q.png`;
        const answer = `https://cdn.dagpi.xyz/wtp/pokemon/${pokemon}a.png`;
        const correctPokemon = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

        const allPokemon = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=898");
        const options: string[] = [];

        while (options.length < 9) {
            let option = allPokemon.data.results[client.utils.randomRange(1, 890)];
            if (options.includes(option.name)) continue;
            options.push(option.name);
        }

        if (!options.includes(correctPokemon.data.name)) {
            options.splice(client.utils.randomRange(0, 10), 0, correctPokemon.data.name.toLowerCase());
        } else {
            while (options.length < 10) {
                let option = allPokemon.data.results[client.utils.randomRange(1, 890)];
                if (options.includes(option.name)) continue;
                options.push(option.name);
            }
        }

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id })).setTitle("Who's that Pokemon?").setImage(question);

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu().setCustomId("pokequiz").addOptions(
                options.sort().map((opt) => {
                    return { label: client.utils.titleCase(opt), value: opt.toLowerCase() };
                })
            )
        );

        const msg = (await interaction.reply({
            embeds: [msgEmbed],
            components: [row],
            fetchReply: true
        })) as Message;

        const filter = (i: SelectMenuInteraction) => {
            return i.user.id === interaction.user.id && i.message.id === msg.id;
        };
        const collector = msg.createMessageComponentCollector({ filter, componentType: "SELECT_MENU", time: 1000 * 20 });
        collector.on("collect", async (i) => {
            const guess = i.values[0].toLowerCase();
            if (guess === correctPokemon.data.name.toLowerCase()) {
                msgEmbed
                    .setImage(answer)
                    .setTitle(`It's ${client.utils.titleCase(correctPokemon.data.name)}!`)
                    .setColor("GREEN")
                    .setFooter({ text: "You're correct!" });
            } else {
                msgEmbed
                    .setImage(answer)
                    .setTitle(`It's ${client.utils.titleCase(correctPokemon.data.name)}!`)
                    .setColor("RED")
                    .setFooter({ text: `You guessed ${client.utils.titleCase(guess)}` });
            }
            await i.update({ embeds: [msgEmbed], components: [] });
            collector.stop("Guessed");
        });

        collector.on("end", async (i, reason) => {
            if (reason === "Guessed") return;
            msgEmbed
                .setImage(answer)
                .setTitle(`It's ${client.utils.titleCase(correctPokemon.data.name)}!`)
                .setColor("RED")
                .setFooter({ text: "You did not guess in time." });

            await interaction.editReply({ embeds: [msgEmbed], components: [] });
        });
        return;
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};
