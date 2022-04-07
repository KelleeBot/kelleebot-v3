import { stripIndents } from "common-tags";
import firstMessage from "../util/helpers/firstMessage";
import { Client } from "../util/client";
import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";

export default (client: Client) => {
    const channelID = "732786545169399838"; // #rules-and-reactions channel
    const getEmoji = (emojiName: string) => client.emojis.cache.find((emoji) => emoji.name == emojiName);

    const emojis = {
        "✨": {
            role: "EE",
            description: "**For access to the Discord, please react with**"
        },
        "🧐": {
            role: "Live",
            description: "**If you want to get notified for when Kéllee goes `Live`, react with**"
        },
        kellee1HeartEyes: {
            role: "ACNH",
            description: "**For access to the <#754196934985646171> channel, react with**"
        },
        "🍚": {
            role: "POKE",
            description: "**For access to the <#754196970813390878> channel, react with**"
        },
        "🇹": {
            role: "TET",
            description: "**For access to the <#754196992254804048> channel, react with**"
        },
        "🍜": {
            role: "Anime",
            description: "**For access to the <#754487781220286474> channel, react with**"
        },
        "⚔️": {
            role: "GI",
            description: "**For access to the <#775809627589312532> channel, react with**"
        },
        "🎬": {
            role: "Movie Nights",
            description: "**If you want to get notified for `Movie Nights`, react with**"
        },
        kellee4Star: {
            role: "He/Him"
        },
        kellee3Star: {
            role: "She/Her"
        },
        kellee2Star: {
            role: "They/Them"
        }
    } as { [key: string]: { role: string; description?: string } };

    const reactions = [];
    let emojiText = stripIndents`
  :waning_crescent_moon: Hi Welcome to the Lunar Circle! (づ｡◕‿‿◕｡)づ :waxing_crescent_moon:
  
  **Some House Rules:**
  1. We ask that you do not spam the Discord and to keep all messages within the appropriate text channels.
  2. Please be respectful and kind to others within the Discord. We do not tolerate any bullying, sexism, racism, homophobia or other hate-based chat of any kind.
  3. Listen to the moderators of the server (\`Mr + Ms Baby\` role) and either contact them or Kéllee if you have any issues with another member.
  4. Follow the Discord Terms of Service: https://discordapp.com/tos
  `;

    for (const key in emojis) {
        const emoji = getEmoji(key) || key;
        reactions.push(emoji);
        if (emoji === "✨" || emoji === "🎬") {
            if (emoji === "✨") {
                emojiText += "\n\n";
            }
            emojiText += `${emoji} ${emojis[key].description} ${emoji}
-----------------------------------------------------------------------------------------------\n`;
        } else if (
            //@ts-ignore
            emoji.name === "kellee4Star" ||
            //@ts-ignore
            emoji.name === "kellee3Star" ||
            //@ts-ignore
            emoji.name === "kellee2Star"
        ) {
            emojiText += `**React with ${emoji} for \`${emojis[key].role}\`**\n`;
        } else {
            emojiText += `${emoji} ${emojis[key].description} ${emoji}\n`;
        }
    }

    //@ts-ignore
    firstMessage(client, channelID, emojiText, reactions);

    const handleReaction = async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, add: boolean) => {
        if (user.bot) return;

        const guild = client.guilds.cache.get("707103910686621758");

        const emoji = reaction.emoji.name;
        if (!emoji) return;

        const roleName = emojis[emoji].role;

        if (!roleName) return;

        const role = guild!.roles.cache.find((role) => role.name === roleName);
        const member = await guild!.members.fetch(user.id);
        if (!member) return;

        if (add) {
            member!.roles.add(role!);
        } else {
            member!.roles.remove(role!);
        }
    };

    client.on("messageReactionAdd", (reaction, user) => {
        if (reaction.message.channel.id === channelID) {
            handleReaction(reaction, user, true);
        }
    });

    client.on("messageReactionRemove", (reaction, user) => {
        if (reaction.message.channel.id === channelID) {
            handleReaction(reaction, user, false);
        }
    });
};
