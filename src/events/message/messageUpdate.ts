import { ColorResolvable, Message, MessageEmbed } from "discord.js";
import { Client } from "../../util/client";
import { MESSAGE_EVENTS } from "../../../config/embedColours.json";

const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

export default async (client: Client, oldMsg: Message, newMsg: Message) => {
    if (!oldMsg.guild || !newMsg.guild) return;
    if (newMsg.pinned) return;

    const msgEmbed = new MessageEmbed().setColor(MESSAGE_EVENTS as ColorResolvable).setTimestamp();

    if (!oldMsg.partial || !newMsg.partial) {
        msgEmbed
            .setAuthor({
                name: newMsg.author.tag,
                iconURL: newMsg.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`**A [message](${newMsg.url}) sent by ${newMsg.author} was edited in ${newMsg.channel}:**`)
            .setFooter({ text: `ID: ${newMsg.id}` });

        if (oldMsg.content !== newMsg.content) {
            if (newMsg.author.bot) return;
            msgEmbed.addFields(
                {
                    name: "**Old Message**",
                    value: !oldMsg.content ? "Unknown" : oldMsg.content.length > 1024 ? "Message too long." : oldMsg.content
                },
                { name: "**New Message**", value: newMsg.content.length > 1024 ? "Message too long." : newMsg.content }
            );
            return client.utils.sendMessageToBotLog(client, newMsg.guild!, msgEmbed);
        }
    }

    const newM = await newMsg.fetch();
    if (!newM) return;

    if (newM.author.bot || urlRegex.test(newM.content) || newM.embeds.length > 0) return;

    msgEmbed
        .setAuthor({ name: newMsg.author.tag, iconURL: newMsg.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(`**A [message](${newM.url}) sent by ${newM.author} was edited in ${newM.channel}:**`)
        .addFields(
            { name: "**Old Message**", value: "Unknown" },
            { name: "**New Message**", value: newM.content.length > 1024 ? "Message too long." : newM.content }
        )
        .setFooter({ text: `ID: ${newM.id}` });
    return client.utils.sendMessageToBotLog(client, newMsg.guild!, msgEmbed);
};
