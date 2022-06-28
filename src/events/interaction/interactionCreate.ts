import { Collection, Constants, GuildMember, Interaction, MessageSelectMenu, OverwriteResolvable, TextChannel } from "discord.js";
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

            if (customId === "open-ticket") {
                const { guild, user } = interaction;
                const guildInfo = await client.guildInfo.get(guild!.id);

                if (!guildInfo || !guildInfo.tickets! || !guildInfo.tickets.channelCategory)
                    return interaction.reply({ content: "Looks like the ticketing system for this server hasn't been properly set up yet.", ephemeral: true });

                const channel = guild!.channels.cache.find((c) => c.name === `ticket-${user.id}`);
                if (channel) return interaction.reply({ content: "Looks like you already have a ticket open.", ephemeral: true });

                await interaction.deferReply({ ephemeral: true });
                try {
                    const permissionOverwrites: OverwriteResolvable[] = [{
                        id: guild!.roles.everyone.id,
                        deny: ["VIEW_CHANNEL"],
                        type: "role"
                    }, {
                        id: user.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                        type: "member"
                    }];

                    if (guildInfo.tickets.modRole)
                        permissionOverwrites.push({
                            id: guildInfo.tickets.modRole,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                            type: "role"
                        });

                    const ch = await guild!.channels.create(`ticket-${user.id}`, { type: Constants.ChannelTypes.GUILD_TEXT, reason: "For a ticket", permissionOverwrites, parent: guildInfo.tickets.channelCategory });
                    const msg = await ch.send({ content: "A ticket has been created for you. Please note that all mods and admins have access to this channel and will see everything you type. Please state your issue and a mod will respond to you soon." });
                    await msg.pin();
                    return interaction.editReply({ content: `Your ticket has been created: ${ch}` });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return interaction.editReply({ content: `An error occurred and I couldn't create a ticket` });
                }
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

            if (interaction.customId === "edit") {
                const messageID = interaction.fields.getTextInputValue("messageIDInput");
                const newMessage = interaction.fields.getTextInputValue("newMessageInput");

                const channel = interaction.channel as TextChannel;
                const messageToEdit = await channel.messages.fetch(messageID);
                if (!messageToEdit) return await interaction.reply({ content: "That message no longer exists or the message doesn't exist in this channel.", ephemeral: true });

                if (messageToEdit.author.id !== client.user!.id) return interaction.reply({ content: "That message was not sent by me.", ephemeral: true });

                await messageToEdit.edit({ content: newMessage, allowedMentions: { parse: [] } });
                return await interaction.reply({ content: "Message successfully edited!", ephemeral: true });
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
