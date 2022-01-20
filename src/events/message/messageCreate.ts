import { ColorResolvable, Guild, Message, MessageEmbed, User } from "discord.js";
//import { messageCreate } from "../../prefab/events";
import { GUILD_BAN_ADD } from "../../../config/embedColours.json";
import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";
import axios from "axios";

export default async (client: Client, message: Message) => {
  //await messageCreate(client, message);
  try {
    if (!message.guild) return;

    const userInfo = await client.profileInfo.get(message.author.id);
    const scams = await client.scams.get("scams");
    const scamChecker = (value: string) => scams.links.some((element) => value.includes(element));

    if (scamChecker(message.content.toLowerCase())) {
      await banUser(message.author, message.guild, client);
    }

    // Delete any @everyone/@here ping attempts if they don't have the correct perms
    if (!message.member?.permissions.has(["MENTION_EVERYONE"], true) && message.mentions.everyone) {
      message.delete();
    }

    if (message.author.bot || userInfo.isBlacklisted) return;

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

const banUser = async (user: User, guild: Guild, client: Client) => {
  const banUser = await guild.members.ban(user, { days: 7, reason: "Scam detection" })
    .catch((e) => {
      client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    });

  if (!banUser) return;

  const memberObj = {
    guildID: guild.id,
    // @ts-ignore
    userID: banUser.id
  };

  const ban = {
    executor: client.user?.id,
    timestamp: new Date().getTime(),
    reason: "Scam detection"
  };

  await memberInfo.findOneAndUpdate(
    memberObj,
    { ...memberObj, $push: { bans: ban } },
    { upsert: true }
  );

  const msgEmbed = new MessageEmbed()
    .setColor(GUILD_BAN_ADD as ColorResolvable)
    .setAuthor({
      name: `${client.user?.tag}`,
      iconURL: client.user?.displayAvatarURL({ dynamic: true })
    })
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setDescription(`**Member:** ${user.tag}\n**Action:** Ban\n**Reason:** Scam detection`)
    .setTimestamp()
    .setFooter({ text: `ID: ${user.id}` });

  client.utils.sendMessageToBotLog(client, guild, msgEmbed);
};