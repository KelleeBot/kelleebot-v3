import { Collection, CommandInteraction, GuildMember, Interaction } from "discord.js";
//import { interactionCreate } from "../../prefab/events";
import { Client } from "../../util/client";
import { NO_GAMBLING_CHANNEL_SET } from "../../../config/messages.json";

export default async (client: Client, interaction: Interaction) => {
  //await interactionCreate(client, interaction);
  try {
    const userInfo = await client.profileInfo.get(interaction.user.id)
    const botOwner = client.users.cache.get(client.config.devs[0])

    if (interaction.isSelectMenu()) {
      //TODO
    } else if (interaction.isButton()) {
      //TODO
    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      if (command.isAutocomplete && command.autocomplete) {
        await command.autocomplete({ client, interaction })
      }

      const group = interaction.options.getSubcommandGroup(false)!;
      const subcommand = interaction.options.getSubcommand(false)!;

      let sub;
      if (command.groups) sub = command.groups[group].subcommands[subcommand];
      else if (command.subcommands) sub = command.subcommands[subcommand];

      if (sub && sub.isAutocomplete && sub.autocomplete) {
        await sub.autocomplete({ client, interaction })
      }
    } else if (interaction.isCommand()) {
      if (userInfo.isBlacklisted) return;

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // if (!client.config.devs.includes(interaction.user.id)) {
      if (command.guildOnly) {
        if (!interaction.inGuild()) {
          return interaction.reply({
            content: "Slash commands can only be used within servers.",
            ephemeral: true
          });
        }

        const guildInfo = await client.guildInfo.get(interaction.guildId);

        if (command.devOnly && !client.config.devs.includes(interaction.user.id)) {
          return await client.utils.quickReply(client, interaction, `Nice try, but only ${botOwner?.tag} can use this command.`);
        }

        if (
          command.ownerOnly &&
          interaction.guild!.ownerId !== interaction.user.id
        )
          return await client.utils.quickReply(
            client,
            interaction,
            "This command can only be used by the server owner."
          );

        if (guildInfo.disabledCommands.includes(command.name))
          return await client.utils.quickReply(
            client,
            interaction,
            "This command is currently disabled in this server."
          );

        if (
          guildInfo.disabledChannels.includes(
            interaction.channelId
          ) &&
          !command.ignoreDisabledChannels
        )
          return await client.utils.client.utils.quickReply(
            client,
            interaction,
            "You can't use any commands in this channel."
          );

        //@ts-ignore
        if (
          command.clientPerms &&
          !interaction.channel!
            .permissionsFor(interaction.guild!.me!)
            .has(command.clientPerms, true)
        )
          return await client.utils.quickReply(
            client,
            interaction,
            `I can't execute this command as I am missing the following permissions: ${client.utils.missingPermissions(
              interaction.guild!.me!,
              command.clientPerms
            )}.`
          );

        if (
          guildInfo.commandPerms &&
          guildInfo.commandPerms[command.name] &&
          //@ts-ignore
          !interaction.member.permissions.has(
            guildInfo.commandPerms[command.name],
            true
          )
        )
          return await client.utils.quickReply(
            client,
            interaction,
            `Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${client.utils.missingPermissions(
              interaction.member! as GuildMember,
              guildInfo.commandPerms[command.name]
            )}.`
          );
        else if (
          command.perms &&
          //@ts-ignore
          !interaction.member.permissions.has(command.perms, true)
        )
          return await client.utils.quickReply(
            client,
            interaction,
            `Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${client.utils.missingPermissions(
              interaction.member as GuildMember,
              command.perms
            )}.`
          );

        //@ts-ignore
        if (command.nsfw && !interaction.channel.nsfw)
          return await client.utils.quickReply(
            client,
            interaction,
            `This command may only be used in an NSFW channel.`
          );

        if (command.category === "Gambling") {
          const { gamblingChannel } = guildInfo.gambling
          if (gamblingChannel) {
            if (interaction.channelId !== gamblingChannel) {
              return await client.utils.quickReply(client, interaction, `This command can only be used in <#${gamblingChannel}>!`)
            }
          } else {
            return await client.utils.quickReply(client, interaction, NO_GAMBLING_CHANNEL_SET);
          }
        }
      }
      // }

      const cd = await client.utils.getCooldown(command, interaction);

      let cooldowns;
      if (cd) {
        if (
          typeof command.globalCooldown === "undefined" ||
          command.globalCooldown
        ) {
          if (!client.globalCooldowns.has(command.name))
            client.globalCooldowns.set(command.name, new Collection());
          cooldowns = client.globalCooldowns;
        } else {
          if (!client.serverCooldowns.has(interaction.guildId!))
            client.serverCooldowns.set(
              interaction.guildId!,
              new Collection()
            );
          cooldowns = client.serverCooldowns.get(interaction.guildId!);
          if (!cooldowns!.has(command.name))
            cooldowns!.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns!.get(command.name);
        const cooldownAmount = cd * 1000;
        if (timestamps!.has(interaction.user.id)) {
          const expirationTime =
            timestamps!.get(interaction.user.id)! + cooldownAmount;
          if (now < expirationTime)
            return await client.utils.quickReply(
              client,
              interaction,
              `Please wait \`${client.utils.msToTime(
                expirationTime - now
              )}\` before using this command again.`
            );
        }
      }
      // }

      const group = interaction.options.getSubcommandGroup(false)!;
      const subcommand = interaction.options.getSubcommand(false)!;

      try {
        let sub;
        if (command.groups) sub = command.groups[group].subcommands[subcommand];
        else if (command.subcommands) sub = command.subcommands[subcommand];

        if (sub && sub.execute)
          //@ts-ignore
          return await sub.execute({ client, interaction, group, subcommand });

        //@ts-ignore
        await command.execute({ client, interaction, group, subcommand });
      } catch (e) {
        client.utils.log(
          "ERROR",
          `${__filename}`,
          `Error running command '${command.name}'`
        );
        console.log(e);
      }
    }
  } catch (e) {
    client.utils.log("ERROR", `${__filename}`, "");
    console.log(e);
  }
};