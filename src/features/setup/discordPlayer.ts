import { ColorResolvable, MessageEmbed, Util } from "discord.js";
import { Client } from "../../util/client";
import { MUSIC_COMMANDS } from "../../../config/embedColours.json";
import { Queue, Track } from "discord-player";

export default async (client: Client) => {
    const msgEmbed = new MessageEmbed().setColor(MUSIC_COMMANDS as ColorResolvable);
    client.player.on("trackStart", (queue: Queue, track: Track) => {
        //@ts-ignore
        const { guild, channel } = queue.metadata;
        const nextTrack = queue.tracks;

        msgEmbed
            .setAuthor({ name: "Now Playing", iconURL: client.utils.getGuildIcon(guild)! })
            .setThumbnail(`${track.thumbnail}`)
            .setDescription(`[${Util.escapeMarkdown(track.title)}](${track.url}) (${track.duration
                })\n\n**Up Next: **${nextTrack[0] ? `\`${nextTrack[0].title}\`` : "Nothing"}`
            )
            .setFooter({
                text: `Requested by ${track.requestedBy.tag}`, iconURL: `${track.requestedBy.displayAvatarURL({ dynamic: true })}`
            });

        return channel.send({ embeds: [msgEmbed] });
    })
        .on("trackAdd", (queue: Queue, track: Track) => {
            //@ts-ignore
            const { guild, channel } = queue.metadata;
            msgEmbed
                .setAuthor({ name: "Track Added", iconURL: client.utils.getGuildIcon(guild)! })
                .setThumbnail(`${track.thumbnail}`)
                .setDescription(
                    `[${Util.escapeMarkdown(track.title)}](${track.url}) (${track.duration}) has been added to the queue!\n\nThere's now \`${queue.tracks.length
                    }\` song${queue.tracks.length !== 1 ? "s" : ""} in the queue.`
                )
                .setFooter({
                    text: `Added by ${track.requestedBy.tag}`,
                    iconURL: `${track.requestedBy.displayAvatarURL({ dynamic: true })}`
                });
            return channel.send({ embeds: [msgEmbed] });
        })
        .on("tracksAdd", (queue: Queue, tracks: Track[]) => {
            //@ts-ignore
            const { guild, channel } = queue.metadata;
            msgEmbed
                .setAuthor({ name: "Playlist Added", iconURL: client.utils.getGuildIcon(guild)! })
                .setThumbnail(client.user!.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `\`${tracks.length}\` track${tracks.length !== 1 ? "s" : ""
                    } have been loaded.\n\nTotal time: \`${client.utils.msToTime(queue.totalTime)}\``
                )
                .setFooter({
                    text: `Added by ${tracks[0].requestedBy.tag}`,
                    iconURL: `${tracks[0].requestedBy.displayAvatarURL({ dynamic: true })}`
                });
            return channel.send({ embeds: [msgEmbed] });
        })
        .on("botDisconnect", (queue: Queue) => {
            //@ts-ignore
            const { guild, channel } = queue.metadata;
            msgEmbed
                .setAuthor({ name: "Bot Disconnected", iconURL: client.utils.getGuildIcon(guild)! })
                .setThumbnail(client.user!.displayAvatarURL({ dynamic: true }))
                .setDescription("⏹️ | Music stopped as I have been disconnected from the voice channel.");
            return channel.send({ embeds: [msgEmbed] });
        });
};