import { Client } from "../../util/client";
import { DEFAULT } from "../../../config/colors.json";
import { stripIndents } from "common-tags";
import { ColorResolvable, Guild, MessageEmbed } from "discord.js";

export default async (client: Client, guild: Guild) => {
    client.utils.log("WARNING", `${__filename}`, `${guild.name} is currently down.`);
    try {
        const owner = await guild.fetchOwner();
        const msgEmbed = new MessageEmbed()
            .setColor(DEFAULT as ColorResolvable)
            .setTitle(`${guild.name} Server Outage`)
            .setDescription(
                stripIndents`
                Hey ${owner.user},

                Just here to inform you that your server **${guild.name}** is currently suffering from a outage. Unfortunately, I do not know when it will be back, but do keep checking periodically to see when it's back up and running!
                
                Sincerely everyone's favourite bot,
                
                ${client.user?.tag}
            `
            )
            .setFooter({
                text: "Please do not reply to this DM as this is not monitored.",
                iconURL: client.utils.getGuildIcon(guild)!
            })
            .setTimestamp();
        return owner.send({ embeds: [msgEmbed] });
    } catch (e) {
        return client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
}
