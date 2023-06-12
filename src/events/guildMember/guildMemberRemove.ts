import { ColorResolvable, GuildMember } from "discord.js";
import { Client } from "../../util/client";
import { GUILD_MEMBER_EVENTS } from "../../../config/embedColours.json";
import gambling from "../../schemas/gambling";

export default async (client: Client, member: GuildMember) => {
  const { guild, user } = member;

  // Delete gambling points from database
  await gambling.deleteOne({ guildID: guild.id, userID: user.id });

  const joinedTimestamp = Math.round(member.joinedTimestamp! / 1000);
  const leftTimestamp = Math.round(Date.now() / 1000);

  const msgEmbed = client.utils
    .createEmbed()
    .setColor(GUILD_MEMBER_EVENTS as ColorResolvable)
    .setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true })
    })
    .setDescription(`**${user} has left the server**`)
    .addFields(
      {
        name: "**Joined**",
        value: `<t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)`,
        inline: false
      },
      {
        name: "**Left**",
        value: `<t:${leftTimestamp}:F> (<t:${leftTimestamp}:R>)`,
        inline: false
      }
    )
    .setFooter({ text: `Members: ${guild.memberCount} - ID: ${user.id}` })
    .setTimestamp();

  // const fetchedLog = await client.utils.fetchAuditLog(guild, "MEMBER_KICK");
  // if (!fetchedLog) {
  //     msgEmbed.setDescription(`**${user} has left the server**`);
  //     return client.utils.sendMessageToBotLog(client, guild, msgEmbed);
  // }

  // const kickLog = fetchedLog.entries.first();
  // if (!kickLog) {
  //     msgEmbed.setDescription(`**${user} has left the server**`);
  //     return client.utils.sendMessageToBotLog(client, guild, msgEmbed);
  // }

  // const { executor, target } = kickLog;
  // msgEmbed.setDescription(
  //     `${(target! as GuildMember).id === member.id
  //         ? `**${user} was kicked from the server by ${executor}**`
  //         : `**${user} has left the server**`
  //     }`
  // );
  return client.utils.sendMessageToBotLog(client, guild, msgEmbed);
};
