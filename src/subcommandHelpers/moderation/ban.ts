import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";
import {
  ButtonInteraction,
  ColorResolvable,
  CommandInteraction,
  GuildMember,
  Message,
  User
} from "discord.js";
import { GUILD_BAN_ADD } from "../../../config/embedColours.json";

export const ban = async (client: Client, interaction: CommandInteraction) => {
  const { guild } = interaction;
  const user =
    interaction.options.getUser("user") ??
    (await client.users
      .fetch(interaction.options.getUser("user")!)
      .catch((e) =>
        client.utils.log(
          "ERROR",
          `${__filename}`,
          `An error has occurred: ${e}`
        )
      ));
  const reason = interaction.options.getString("reason")!;

  if (!user)
    return interaction.reply({
      content: "A user was not found with that ID.",
      ephemeral: true
    });

  const member = guild!.members.cache.get(user.id);

  if (user.id === interaction.user.id)
    return interaction.reply({
      content: "Now why would you want to ban yourself?",
      ephemeral: true
    });

  if (user.id === client.user?.id)
    return interaction.reply({
      content: "Nah, I don't think so. I'm un-bannable.",
      ephemeral: true
    });

  // If the user is a member of the guild we are trying to ban from
  if (member) {
    if (!member.bannable || !member.manageable || !member.moderatable)
      return interaction.reply({
        content: "I do not have the permissions to ban that member.",
        ephemeral: true
      });

    if (
      (interaction.member as GuildMember).roles.highest.comparePositionTo(
        member.roles.highest
      ) < 0
    )
      return interaction.reply({
        content: "You can't ban a member with a higher role than you.",
        ephemeral: true
      });
  }

  try {
    const userInfo = await client.utils.fetchMemberInfo(
      interaction.guildId!,
      user.id
    );
    const userInfoEmbed = client.utils
      .createEmbed()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setColor(GUILD_BAN_ADD as ColorResolvable);

    const buttonRow = client.utils
      .createActionRow()
      .addComponents(
        client.utils
          .createButton()
          .setCustomId("ban_yes")
          .setLabel("Yes")
          .setStyle("SUCCESS"),
        client.utils
          .createButton()
          .setCustomId("ban_no")
          .setLabel("No")
          .setStyle("DANGER")
      );

    if (!userInfo) {
      userInfoEmbed.setDescription(
        `- Warns: 0\n- Mutes: 0\n- Kicks: 0\n- Bans: 0\n- Soft Bans: 0\n- Unbans: 0\n`
      );
    } else {
      const { bans, warnings, kicks, unbans, softbans, mutes } = userInfo;
      userInfoEmbed.setDescription(
        `- Warns: ${warnings.length}\n- Mutes: ${mutes.length}\n- Kicks: ${kicks.length}\n- Bans: ${bans.length}\n- Soft Bans: ${softbans.length}\n- Unbans: ${unbans.length}\n`
      );
    }

    const msg = await client.utils.fetchReply(interaction, {
      content: `Are you sure you want to ban **${user.tag}** for ${reason}?`,
      embeds: [userInfoEmbed],
      components: [buttonRow]
    });

    if (!msg)
      return interaction.reply({
        content: `An error has occurred and **${user.tag}** was not banned. Please try again.`,
        ephemeral: true
      });

    const filter = async (i: ButtonInteraction) => {
      await i.deferUpdate();
      return (
        (i.customId == "ban_yes" || i.customId == "ban_no") &&
        i.user.id == interaction.user.id
      );
    };

    const collector = msg.createMessageComponentCollector({
      filter,
      componentType: "BUTTON",
      time: 1000 * 15
    });
    collector.on("collect", async (button) => {
      if (button.customId === "ban_yes") {
        await banUser(user, button, client, reason);
      } else {
        await button.editReply({
          content: `**${user.tag}** was not banned.`,
          embeds: [],
          components: []
        });
      }
      collector.stop();
    });

    collector.on("end", async (_collected, reason) => {
      if (reason === "time")
        await msg.edit({
          content: `You did not choose a response in time. **${user.tag}** was not banned.`,
          embeds: [],
          components: []
        });
    });
  } catch (e: any) {
    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    return interaction.reply({
      content: `An error has occurred and **${user.tag}** was not kicked. Please try again.`,
      ephemeral: true
    });
  }
};

const banUser = async (
  user: User,
  button: ButtonInteraction,
  client: Client,
  reason: string
) => {
  const banMsg = (await button.editReply({
    content: `Banning **${user.tag}**...`,
    embeds: [],
    components: []
  })) as Message;

  const fetchBans = await button.guild!.bans.fetch();
  if (fetchBans) {
    const bannedUser = fetchBans.find((b) => b.user.id === user.id);
    if (bannedUser)
      return banMsg.edit({
        content: `Looks like ${user.tag} is already banned from this server.`,
        embeds: [],
        components: []
      });

    const banUser = await button
      .guild!.members.ban(user, { days: 7, reason })
      .catch((e) => {
        client.utils.log(
          "ERROR",
          `${__filename}`,
          `An error has occurred: ${e}`
        );

        return banMsg.edit({
          content: `There was an error and **${user.tag}** was not banned. Please try again.`,
          embeds: [],
          components: []
        });
      });

    if (!(banUser instanceof User) || !(banUser instanceof GuildMember)) return;

    if (banUser) {
      const memberObj = { guildID: button.guildId, userID: banUser.id };

      const ban = {
        executor: button.user.id,
        timestamp: new Date().getTime(),
        reason
      };

      await memberInfo.findOneAndUpdate(
        memberObj,
        { ...memberObj, $push: { bans: ban } },
        { upsert: true }
      );

      banMsg.edit({
        content: `Successfully banned **${user.tag}**.`,
        embeds: [],
        components: []
      });

      const msgEmbed = client.utils
        .createEmbed()
        .setColor(GUILD_BAN_ADD as ColorResolvable)
        .setAuthor({
          name: button.user.tag,
          iconURL: button.user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `**Member:** ${user.tag}\n**Action:** Ban\n**Reason:** ${reason}`
        )
        .setTimestamp()
        .setFooter({ text: `ID: ${user.id}` });
      return client.utils.sendMessageToBotLog(client, button.guild!, msgEmbed);
    }
  }
  return;
};
