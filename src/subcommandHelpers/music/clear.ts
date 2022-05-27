import { Client } from "../../util/client";
import { MUSIC_COMMANDS } from "../../../config/embedColours.json";
import { ColorResolvable, CommandInteraction, GuildMember } from "discord.js";

export const clear = async (client: Client, interaction: CommandInteraction) => {
    const { guild } = interaction;
    const { member } = interaction as { member: GuildMember };
    const queue = client.player.getQueue(guild!.id);

    try {
        if (!member!.voice.channel)
            return await interaction.reply({ content: "❌ | You need to be in a voice channel in order to use this command!", ephemeral: true });

        if (!queue || !queue.playing)
            return await interaction.reply({ content: "❌ | There is currently no music playing in the server.", ephemeral: true });

        queue.clear();

        const msgEmbed = client.utils
            .createEmbed()
            .setAuthor({ name: "Queue Cleared", iconURL: client.utils.getGuildIcon(guild!) })
            .setColor(MUSIC_COMMANDS as ColorResolvable)
            .setDescription("Music queue has been cleared.")
            .setFooter({
                text: `Cleared by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            });

        return await interaction.reply({ embeds: [msgEmbed] });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};
