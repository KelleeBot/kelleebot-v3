import { Message } from "discord.js";
//import { messageCreate } from "../../prefab/events";
import { Client } from "../../util/client";
import axios from "axios";

export default async (client: Client, message: Message) => {
  //await messageCreate(client, message);
  try {
    const userInfo = await client.profileInfo.get(message.author.id);

    if (message.author.bot || message.channel.type === "DM" || userInfo.isBlacklisted) return;

    const guildInfo = await client.guildInfo.get(message.guildId!);
    if (!guildInfo.botChatChannel) return;

    if (guildInfo.botChatChannel === message.channelId) {
      message.channel.sendTyping();
      const resp = await axios.get(`https://api.deltaa.me/chatbot?message=${encodeURIComponent(
        message.content
      )}&name=${encodeURIComponent(client.user!.username)}&user=${message.author.id
        }&gender=Female`);

      return message.reply({ content: resp.data.message });
    }
  } catch (e) {
    return client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
  }
};
