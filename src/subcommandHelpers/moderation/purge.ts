import { ColorResolvable, CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { MESSAGE_EVENTS } from "../../../config/embedColours.json";

export const purge = async (client: Client, interaction: CommandInteraction) => {
    const number = interaction.options.getInteger("number")!;
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;

    // if (number < 1 || number > 100) return interaction.reply({ content: "Number must be between 1 and 100.", ephemeral: true });

    if (channel?.type !== "GUILD_TEXT") return interaction.reply({ content: "You can only purge messages from text channels.", ephemeral: true });

    try {
        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setAuthor({ name: "Messages Purged" })
            .setFooter({ text: `Purged by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const guildInfo = await client.guildInfo.get(interaction.guildId!);
        const { botLoggingChannel } = guildInfo;
        if (channel.id === botLoggingChannel) return interaction.reply({ content: "Messages from this channel cannot be purged.", ephemeral: true });

        const messages = await channel.bulkDelete(number);
        if (messages) {
            msgEmbed.setDescription(`Successfully purged ${client.utils.pluralize(messages.size, "message", true)} from ${channel}.`);
            await interaction.reply({ embeds: [msgEmbed], ephemeral: true });

            const botEmbed = client.utils
                .createEmbed()
                .setColor(MESSAGE_EVENTS as ColorResolvable)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`${interaction.user} purged ${client.utils.pluralize(messages.size, "message", true)} from ${channel}.`)
                .setTimestamp();

            return client.utils.sendMessageToBotLog(client, interaction.guild!, botEmbed);
        }
    } catch (e) {
        let message;
        if (e instanceof Error) message = e.message;
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.reply({ content: `${message}`, ephemeral: true });
    }
};
