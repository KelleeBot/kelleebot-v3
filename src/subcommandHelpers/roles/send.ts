import { Client } from "../../util/client";
import { CommandInteraction, TextChannel } from "discord.js";

export const send = async (client: Client, interaction: CommandInteraction) => {
    const message = interaction.options.getString("message")!;
    const channel = (interaction.options.getChannel("channel") as TextChannel) ?? (interaction.channel as TextChannel);

    try {
        if (channel.type !== "GUILD_TEXT")
            return await interaction.reply({ content: "Please ensure that the channel selected is a text channel.", ephemeral: true });

        const msg = await channel!.send({ content: message });
        return await interaction.reply({ content: `Your message has been sent.\n\nThe message ID is ${msg.id}.`, ephemeral: true });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: `An error has occurred. Please try again.`, ephemeral: true });
    }
};
