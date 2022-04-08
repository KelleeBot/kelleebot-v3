import { Client } from "../../util/client";
import { MUSIC_COMMANDS } from "../../../config/embedColours.json";
import { ColorResolvable, CommandInteraction, GuildMember, Util } from "discord.js";

export const queue = async (client: Client, interaction: CommandInteraction) => {
    const { guild } = interaction;
    const { member } = interaction as { member: GuildMember };
    const queue = client.player.getQueue(guild!.id);

    try {
        if (!member!.voice.channel)
            return await interaction.reply({ content: "❌ | You need to be in a voice channel in order to use this command!", ephemeral: true });

        if (!queue || !queue.playing)
            return await interaction.reply({ content: "❌ | There is currently no music playing in the server.", ephemeral: true });

        const tracks = queue.tracks;
        let tracksArray = client.utils.chunkArray(tracks, 10);
        if (tracksArray.length == 1) {
            const msgEmbed = client.utils
                .createEmbed()
                .setColor(MUSIC_COMMANDS as ColorResolvable)
                .setAuthor({ name: "Music Queue", iconURL: client.utils.getGuildIcon(interaction.guild!)! });

            if (tracks.length == 0) {
                msgEmbed.setDescription("There are no songs in the queue.");
                return await interaction.reply({ embeds: [msgEmbed] });
            }

            let text = "";
            for (let i = 0; i < tracks.length; i++) {
                text += `${i + 1}. [${Util.escapeMarkdown(tracks[i].title)}](${tracks[i].url}) (${tracks[i].duration}) - Requested by ${
                    tracks[i].requestedBy
                }\n`;
            }
            msgEmbed.setDescription(text).setFooter({
                text: `Total Songs: ${tracks.length} | Total Duration: ${client.utils.msToTime(queue.totalTime)}`
            });
            return await interaction.reply({ embeds: [msgEmbed] });
        }

        const embedArray = [];
        for (let i = 0; i < tracksArray.length; i++) {
            let text = "";
            const msgEmbed = client.utils
                .createEmbed()
                .setColor(MUSIC_COMMANDS as ColorResolvable)
                .setAuthor({ name: "Music Queue", iconURL: client.utils.getGuildIcon(interaction.guild!)! });

            let counter = (i + 1) * 10 - 10;
            for (let j = 0; j < tracksArray[i].length; j++) {
                text += `${counter + 1}. [${Util.escapeMarkdown(tracksArray[i][j].title)}](${tracksArray[i][j].url}) (${
                    tracksArray[i][j].duration
                }) - Requested by ${tracksArray[i][j].requestedBy}\n`;
                counter++;
            }

            msgEmbed.setDescription(text).setFooter({
                text: `Total Songs: ${tracks.length} | Total Duration: ${client.utils.msToTime(queue.totalTime)} | Page ${i + 1} of ${
                    tracksArray.length
                }`
            });
            embedArray.push(msgEmbed);
        }
        return client.utils.paginate(interaction, embedArray, { time: 1000 * 60 });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};
