import { Collection, GuildMember, Interaction, MessageSelectMenu } from "discord.js";
//import { interactionCreate } from "../../prefab/events";
import { Client } from "../../util/client";
import { NO_GAMBLING_CHANNEL_SET } from "../../../config/messages.json";

export default async (client: Client, interaction: Interaction) => {
    //await interactionCreate(client, interaction);
    try {
        const userInfo = await client.profileInfo.get(interaction.user.id);
        const botOwner = client.users.cache.get(client.config.DEVS[0]);

        if (interaction.isSelectMenu()) {
            const { customId, values, member } = interaction;
            if (customId === "auto_roles" && member instanceof GuildMember) {
                const addedRoles: string[] = [];
                const removedRoles: string[] = [];

                const component = interaction.component as MessageSelectMenu;
                const removed = component.options.filter((option) => !values.includes(option.value));
                const currentRoles = member.roles.cache.map((r) => r.id);

                for (const id of removed) {
                    removedRoles.push(id.value);
                    member.roles.remove(id.value);
                }

                for (const id of values) {
                    addedRoles.push(id);
                    member.roles.add(id);
                }

                const allRemoved = currentRoles.filter((val) => removedRoles.includes(val));
                const allAdded = addedRoles.filter((val) => !currentRoles.includes(val));

                const addedMsg = allAdded.length ? `\n**Added:**\n${allAdded.map((r) => `• <@&${r}>`).join("\n")}` : "";
                const removedMsg = allRemoved.length ? `\n**Removed:**\n${allRemoved.map((r) => `• <@&${r}>`).join("\n")}` : "";
                return interaction.reply({
                    content: `Your roles have been updated!${addedMsg}${removedMsg}`,
                    ephemeral: true,
                    allowedMentions: { parse: [] }
                });
            }
        } else if (interaction.isButton()) {
            const { customId, member } = interaction;
            if (customId === "roles" && member instanceof GuildMember) {
                const roles = member.roles.cache
                    .sort((a, b) => b.position - a.position)
                    .filter((r) => r.name !== "@everyone")
                    .map((r) => `• ${r.name}`);
                return interaction.reply({
                    content: `Here are all your roles for **${member.guild.name}**:\n${roles.join("\n")}`,
                    ephemeral: true
                });
            }
        } else if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.isAutocomplete && command.autocomplete) {
                await command.autocomplete({ client, interaction });
            }

            const group = interaction.options.getSubcommandGroup(false)!;
            const subcommand = interaction.options.getSubcommand(false)!;

            let sub;
            if (command.groups) sub = command.groups[group].subcommands[subcommand];
            else if (command.subcommands) sub = command.subcommands[subcommand];

            if (sub && sub.isAutocomplete && sub.autocomplete) {
                await sub.autocomplete({ client, interaction });
            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId === "twitch") {
                const twitchChannel = interaction.fields.getTextInputValue("twitchChannelInput");
                const liveMessage = interaction.fields.getTextInputValue("liveMessageInput");

                if (!["GUILD_NEWS", "GUILD_TEXT"].includes(interaction.channel?.type!))
                    return await interaction.reply({ content: "Only text/announcements channels can be set as the Twitch notification channel. Please run this command again in one of those channel types.", ephemeral: true });

                if (interaction.channel!.isThread())
                    return await interaction.reply({
                        content: "Thread channels can not be used as the Twitch notification channel.",
                        ephemeral: true
                    });

                if (!(await client.utils.doesTwitchChannelExist(client, twitchChannel)))
                    return await interaction.reply({
                        content: `Looks like the channel **${twitchChannel}** doesn't exist on Twitch. Please try another channel.`,
                        ephemeral: true
                    });

                await client.guildInfo.findByIdAndUpdate(
                    interaction.guildId!,
                    {
                        "streamerLive.channelID": interaction.channelId,
                        "streamerLive.twitchChannel": twitchChannel,
                        "streamerLive.message": liveMessage
                    },
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );

                return await interaction.reply({ content: "Twitch live notification successfully set!", ephemeral: true });
            }
        } else if (interaction.isCommand()) {
            if (userInfo.isBlacklisted)
                return interaction.reply({
                    content: `You have been blacklisted from using commands. If you think this is a mistake, please DM ${botOwner}.`,
                    ephemeral: true
                });

            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // if (!client.config.DEVS.includes(interaction.user.id)) {
            if (command.guildOnly) {
                if (!interaction.inGuild())
                    return await client.utils.quickReply(client, interaction, "Slash commands can only be used within servers.");

                const guildInfo = await client.guildInfo.get(interaction.guildId);

                if (command.devOnly && !client.config.DEVS.includes(interaction.user.id))
                    return await client.utils.quickReply(client, interaction, `Nice try, but only ${botOwner?.tag} can use this command.`);

                if (command.ownerOnly && interaction.guild!.ownerId !== interaction.user.id)
                    return await client.utils.quickReply(client, interaction, "This command can only be used by the server owner.");

                if (guildInfo.disabledCommands.includes(command.name))
                    return await client.utils.quickReply(client, interaction, "This command is currently disabled in this server.");

                if (guildInfo.disabledChannels.includes(interaction.channelId) && !command.ignoreDisabledChannels)
                    return await client.utils.client.utils.quickReply(client, interaction, "You can't use any commands in this channel.");

                if (command.clientPerms && !interaction.channel!.permissionsFor(interaction.guild!.me!).has(command.clientPerms, true))
                    return await client.utils.quickReply(
                        client,
                        interaction,
                        `I can't execute this command as I am missing the following permissions: ${client.utils.missingPermissions(
                            interaction.guild!.me!,
                            command.clientPerms
                        )}.`
                    );

                const member = await interaction.guild!.members.fetch(interaction.user.id);
                if (
                    guildInfo.commandPerms &&
                    guildInfo.commandPerms[command.name] &&
                    !member.permissions.has(guildInfo.commandPerms[command.name], true)
                )
                    return await client.utils.quickReply(
                        client,
                        interaction,
                        `Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${client.utils.missingPermissions(
                            member,
                            guildInfo.commandPerms[command.name]
                        )}.`
                    );
                else if (command.perms && !member.permissions.has(command.perms, true))
                    return await client.utils.quickReply(
                        client,
                        interaction,
                        `Woah there! Nice try, but you don't have the proper permissions to execute this command. You'll need one of the following permissions: ${client.utils.missingPermissions(
                            member,
                            command.perms
                        )}.`
                    );

                if (command.nsfw && (interaction.channel!.isThread() || !interaction.channel!.nsfw))
                    return await client.utils.quickReply(client, interaction, `This command may only be used in an NSFW channel.`);

                if (command.category === "Gambling") {
                    const { gamblingChannel } = guildInfo.gambling;
                    if (gamblingChannel) {
                        if (interaction.channelId !== gamblingChannel) {
                            return await client.utils.quickReply(client, interaction, `This command can only be used in <#${gamblingChannel}>!`);
                        }
                    } else {
                        return await client.utils.quickReply(client, interaction, NO_GAMBLING_CHANNEL_SET);
                    }
                }
            }
            // }

            // if (!(await command.additionalChecks(interaction))) return;
            const cd = await client.utils.getCooldown(command, interaction);

            let cooldowns;
            if (cd) {
                if (typeof command.globalCooldown === "undefined" || command.globalCooldown) {
                    if (!client.globalCooldowns.has(command.name)) client.globalCooldowns.set(command.name, new Collection());
                    cooldowns = client.globalCooldowns;
                } else {
                    if (!client.serverCooldowns.has(interaction.guildId!)) client.serverCooldowns.set(interaction.guildId!, new Collection());
                    cooldowns = client.serverCooldowns.get(interaction.guildId!);
                    if (!cooldowns!.has(command.name)) cooldowns!.set(command.name, new Collection());
                }

                const now = Date.now();
                const timestamps = cooldowns!.get(command.name);
                const cooldownAmount = cd * 1000;
                if (timestamps!.has(interaction.user.id)) {
                    const expirationTime = timestamps!.get(interaction.user.id)! + cooldownAmount;
                    if (now < expirationTime)
                        return await client.utils.quickReply(
                            client,
                            interaction,
                            `Please wait \`${client.utils.msToTime(expirationTime - now)}\` before using this command again.`
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

                if (sub && sub.execute) return await sub.execute({ client, interaction, group, subcommand });

                //@ts-ignore
                await command.execute({ client, interaction, group, subcommand });
            } catch (e) {
                client.utils.log("ERROR", `${__filename}`, `Error running command '${command.name}'`);
                console.log(e);
            }
        }
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, "");
        console.log(e);
    }
};
