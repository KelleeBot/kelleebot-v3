import { ColorResolvable, Guild, Message, MessageEmbed, User } from "discord.js";
import { Client } from "../../util/client";
import { MESSAGE_EVENTS } from "../../../config/embedColours.json"

export default async (client: Client, message: Message) => {
    if (!message.guild) return;

    const fetchedLog = await client.utils.fetchAuditLog(message.guild!, "MESSAGE_DELETE");
    if (!fetchedLog) {
        const msgEmbed =
            createEmbed(client, MESSAGE_EVENTS as ColorResolvable, message.guild!, message, `**A message sent by ${message.author} was deleted in ${message.channel}:**\n${message.content}`);
        return client.utils.sendMessageToBotLog(client, message.guild!, msgEmbed);
    }

    const deletionLog = fetchedLog.entries.first();
    if (!deletionLog) {
        const msgEmbed =
            createEmbed(client, MESSAGE_EVENTS as ColorResolvable, message.guild!, message, `**A message sent by ${message.author} was deleted in ${message.channel}**`);
        return client.utils.sendMessageToBotLog(client, message.guild!, msgEmbed);
    }

    const { executor, target } = deletionLog;
    if (!message.partial) {
        if (message.author.bot) return;

        let description = `**A message sent by ${message.author} was deleted in ${message.channel}${(target! as User).id === message.author.id ? ` by ${executor}` : ""}:**\n`;
        if (message.attachments.size > 0 && message.content) {
            description += `${message.content}\n${message.attachments.first()!.proxyURL}`;
        } else if (message.attachments.size > 0) {
            description += message.attachments.map(a => a.proxyURL).join("\n");
        } else if (message.stickers.size > 0) {
            description += message.stickers.map(s => s.url).join("\n");
        } else {
            description += message.content;
        }

        const msgEmbed =
            createEmbed(client, MESSAGE_EVENTS as ColorResolvable, message.guild!, message, description, message.author);

        return client.utils.sendMessageToBotLog(client, message.guild!, msgEmbed);
    } else {
        const msgEmbed =
            createEmbed(client, MESSAGE_EVENTS as ColorResolvable, message.guild!, message, `**A message was deleted in ${message.channel}**`);
        return client.utils.sendMessageToBotLog(client, message.guild!, msgEmbed);
    }
};

const createEmbed = (client: Client, color: ColorResolvable, guild: Guild, message: Message, description: string, user?: User) => {
    return new MessageEmbed()
        .setColor(color)
        .setAuthor({
            name: user ? user.tag : guild!.name,
            iconURL: user
                ? user.displayAvatarURL({ dynamic: true })
                : client.utils.getGuildIcon(guild)!
        })
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: `ID: ${message.id}` });
};