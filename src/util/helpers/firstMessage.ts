import { Message, Snowflake, TextChannel } from "discord.js";
import { Client } from "../client";

export default async (client: Client, id: Snowflake, text: string, reactions = []) => {
    const channel = (await client.channels.fetch(id)) as TextChannel;
    if (!channel) return;

    const messages = await channel.messages.fetch();
    if (messages.size == 0) {
        const msg = await channel.send({ content: text });
        if (!msg) return;
        addReactions(msg, reactions);
    } else {
        for (const msg of messages) {
            msg[1].edit({ content: text });
            addReactions(msg[1], reactions);
        }
    }
};

const addReactions = (message: Message, reactions: string[]) => {
    message.react(reactions[0]);
    reactions.shift();
    if (reactions.length > 0) setTimeout(() => addReactions(message, reactions), 750);
};
