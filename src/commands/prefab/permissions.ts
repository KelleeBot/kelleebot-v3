import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

const permissions: { [key: string]: string } = {
  a: "CREATE_INSTANT_INVITE",
  b: "KICK_MEMBERS",
  c: "BAN_MEMBERS",
  d: "ADMINISTRATOR",
  e: "MODERATE_MEMBERS",
  f: "MANAGE_CHANNELS",
  g: "MANAGE_GUILD",
  h: "ADD_REACTIONS",
  i: "VIEW_AUDIT_LOG",
  j: "PRIORITY_SPEAKER",
  k: "STREAM",
  l: "VIEW_CHANNEL",
  m: "SEND_MESSAGES",
  n: "SEND_TTS_MESSAGES",
  o: "MANAGE_MESSAGES",
  p: "EMBED_LINKS",
  q: "ATTACH_FILES",
  r: "READ_MESSAGE_HISTORY",
  s: "MENTION_EVERYONE",
  t: "USE_EXTERNAL_EMOJIS",
  u: "VIEW_GUILD_INSIGHTS",
  v: "CONNECT",
  w: "SPEAK",
  x: "MUTE_MEMBERS",
  y: "DEAFEN_MEMBERS",
  z: "MOVE_MEMBERS",
  "0": "USE_VAD",
  "1": "CHANGE_NICKNAME",
  "2": "MANAGE_NICKNAMES",
  "3": "MANAGE_ROLES",
  "4": "MANAGE_WEBHOOKS",
  "5": "MANAGE_EMOJIS_AND_STICKERS",
  "6": "USE_APPLICATION_COMMANDS",
  "7": "REQUEST_TO_SPEAK",
  "8": "MANAGE_THREADS",
  "9": "USE_PUBLIC_THREADS",
  ".": "USE_PRIVATE_THREADS",
  ",": "USE_EXTERNAL_STICKERS"
};
const permsRegEx = /^[0-9a-z\,\.]{1,31}$/i;

export default class Permissions extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "permissions",
      description:
        "Set your own custom permissions that your users need to run this command in your server",
      category: "Utility",
      ownerOnly: true,
      options: [
        {
          name: "command",
          description: "The command you want to change permissions for",
          type: "STRING",
          required: true
        }
      ],
      clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "ADD_REACTIONS"],
      cooldown: 5,
      execute: async ({ client, interaction }) => {
        await this.setCooldown(interaction);

        const name = interaction.options.getString("command")!.toLowerCase();
        const command = client.commands.get(name);

        if (!command) {
          const embed = (
            await client.utils.CustomEmbed({ userID: interaction.user.id })
          )
            .setTimestamp()
            .setDescription(
              `${interaction.user}, the command \`${name}\` doesn't exist.`
            );

          return await interaction.reply({ embeds: [embed] });
        }

        const embed = (
          await client.utils.CustomEmbed({ userID: interaction.user.id })
        )
          .setTimestamp()
          .setTitle(`Command permissions for: ${command.name}`)
          .setFooter({ text: "React with 🔁 to override the permissions." });

        const guildInfo = await client.guildInfo.get(interaction.guildId!);

        if (!guildInfo?.commandPerms || !guildInfo.commandPerms[command.name]) {
          if (command.perms && command.perms.length !== 0)
            embed.setDescription("`" + command.perms.join("`, `") + "`");
          else
            embed.setDescription(
              `${interaction.user}, you don't need any permissions to run this command.`
            );
        } else {
          embed.setDescription(
            "`" + guildInfo.commandPerms[command.name].join("`, `") + "`"
          );
        }

        const msg = await client.utils.fetchReply(interaction, {
          embeds: [embed],
          components: [
            client.utils
              .createActionRow()
              .addComponents([
                client.utils
                  .createButton()
                  .setCustomId("change")
                  .setLabel("Change permissions")
                  .setStyle("PRIMARY")
              ])
          ]
        });

        const button = await msg.awaitMessageComponent({
          filter: (b) =>
            b.customId === "change" && b.user.id === interaction.user.id,
          time: 30000
        });

        let text = "";

        const perms = Object.entries(permissions);

        for (const perm of perms) text += `\`${perm[0]}\` - \`${perm[1]}\`\n`;

        embed
          .setDescription(
            `${interaction.user}, reply with the permissions that you want users to have in order to use this command, e.g.: \`cd2\` If you want them to have the permissions to kick members, ban members and manage roles in order to use this command.\nReply with \`clear\` to reset permissions.`
          )
          .addFields({ name: "Permissions", value: text });

        await button.update({ embeds: [embed], components: [] });

        const reply = await client.utils.getReply(
          interaction.channel!,
          interaction.user.id,
          { time: 60000 }
        );
        if (!reply) {
          const embed = (
            await client.utils.CustomEmbed({ userID: interaction.user.id })
          )
            .setTimestamp()
            .setDescription(`${interaction.user}, time is over!.`);

          return await button.editReply({ embeds: [embed] });
        }

        const content = reply.content.toLowerCase();

        if (content === "clear") {
          await client.guildInfo.findByIdAndUpdate(
            interaction.guildId!,
            { $unset: { [`commandPerms.${command.name}`]: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );

          embed.setDescription(
            `${interaction.user}, the permissions for \`${command.name}\` have been cleared.`
          );
        } else {
          if (!permsRegEx.test(content)) {
            const embed = (
              await client.utils.CustomEmbed({ userID: interaction.user.id })
            )
              .setTimestamp()
              .setDescription(
                `${interaction.user}, that isn't a valid permission string.`
              );

            return await button.editReply({ embeds: [embed] });
          }

          const permsArray: string[] = [];
          for (let i = 0; i < content.length; i++) {
            if (permsArray.includes(permissions[content[i]])) continue;
            permsArray.push(permissions[content[i]]);
          }

          await client.guildInfo.findByIdAndUpdate(
            interaction.guildId!,
            { $set: { [`commandPerms.${command.name}`]: permsArray } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
          embed.setDescription(
            `${interaction.user}, the permissions for \`${command.name}\` have been updated.`
          );
        }

        embed.spliceFields(0, 1);

        await button.editReply({ embeds: [embed] });
      }
    });
  }
}
