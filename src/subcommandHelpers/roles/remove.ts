import { Client } from "../../util/client";
import { CommandInteraction, MessageActionRow, MessageSelectMenu, TextChannel } from "discord.js";

export const remove = async (client: Client, interaction: CommandInteraction) => {
    const id = interaction.options.getString("messageid")!;
    const index = interaction.options.getInteger("position")!;
    const channel = (interaction.options.getChannel("channel")! as TextChannel) ?? (interaction.channel as TextChannel);

    try {
        if (channel.type !== "GUILD_TEXT")
            return await interaction.reply({ content: "Please ensure that the channel selected is a text channel.", ephemeral: true });

        const targetMessage = await channel.messages.fetch(id, { cache: true, force: true });
        if (!targetMessage) return await interaction.reply({ content: "I couldn't find that message", ephemeral: true });

        if (targetMessage.author.id !== client.user?.id)
            return await interaction.reply({ content: "Please provide a message ID for a message that was actually sent by me.", ephemeral: true });

        let row = targetMessage.components[0] as MessageActionRow;
        if (!row) return await interaction.reply({ content: "Looks like there's no dropdown menu attached to that message.", ephemeral: true });

        let menu = row.components[0] as MessageSelectMenu;
        if (!menu) return await interaction.reply({ content: "Looks like there's no dropdown menu attached to that message.", ephemeral: true });

        if (index < 1 || index > menu.options.length)
            return await interaction.reply({ content: `Please enter a number from 1 to ${menu.options.length}.`, ephemeral: true });

        const removedRole = menu.options[index - 1].label;
        menu.spliceOptions(index - 1, 1);
        if (menu.options.length < 1)
            return await interaction.reply({ content: "You can not remove anymore roles as there should be at least one.", ephemeral: true });

        menu.setMaxValues(menu.options.length);

        await targetMessage.edit({ components: [row] });
        return await interaction.reply({ content: `\`${removedRole}\` has successfully been removed from the dropdown menu.`, ephemeral: true });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: `An error has occurred. Please try again.`, ephemeral: true });
    }
};
