import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";
import { ButtonInteraction, ColorResolvable, CommandInteraction, GuildMember, Message, User } from "discord.js";
import { MUTE, GUILD_BAN_REMOVE } from "../../../config/embedColours.json";

export const softban = async (client: Client, interaction: CommandInteraction) => {
    try {
        const member = interaction.options.getMember("user", true) as GuildMember;
        const reason = interaction.options.getString("reason", true);

        if (member.id === interaction.user.id) return interaction.reply({ content: "You can't softban yourself. silly.", ephemeral: true });

        if (member.id === client.user?.id) return interaction.reply({ content: "I don't think so.", ephemeral: true });

        if (!member.bannable || !member.manageable || !member.moderatable)
            return interaction.reply({ content: "I do not have the permissions to softban that member.", ephemeral: true });

        if ((interaction.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) < 0)
            return interaction.reply({ content: "You can't softban a member with a higher role than you.", ephemeral: true });

        const userInfo = await client.utils.fetchMemberInfo(interaction.guildId!, member.id);
        const userInfoEmbed = client.utils
            .createEmbed()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setColor(MUTE as ColorResolvable);

        const buttonRow = client.utils
            .createActionRow()
            .addComponents(
                client.utils.createButton().setCustomId("softban_yes").setLabel("Yes").setStyle("SUCCESS"),
                client.utils.createButton().setCustomId("softban_no").setLabel("No").setStyle("DANGER")
            );

        if (!userInfo) {
            userInfoEmbed.setDescription(`• Warns: 0\n• Mutes: 0\n• Kicks: 0\n• Bans: 0\n• Soft Bans: 0\n• Unbans: 0\n`);
        } else {
            const { bans, warnings, kicks, unbans, softbans, mutes } = userInfo;
            userInfoEmbed.setDescription(
                `• Warns: ${warnings.length}\n• Mutes: ${mutes.length}\n• Kicks: ${kicks.length}\n• Bans: ${bans.length}\n• Soft Bans: ${softbans.length}\n• Unbans: ${unbans.length}\n`
            );
        }

        const msg = (await interaction.reply({
            content: `Are you sure you want to soft ban **${member.user.tag}** for "${reason}"?`,
            embeds: [userInfoEmbed],
            components: [buttonRow],
            fetchReply: true
        })) as Message;

        if (!msg)
            return interaction.reply({
                content: `An error has occurred and **${member.user.tag}** was not banned. Please try again.`,
                ephemeral: true
            });

        const filter = async (i: ButtonInteraction) => {
            await i.deferUpdate();
            return (i.customId == "softban_yes" || i.customId == "softban_no") && i.user.id == interaction.user.id;
        };

        const collector = msg.createMessageComponentCollector({ filter, componentType: "BUTTON", time: 1000 * 15 });
        collector.on("collect", async (i) => {
            if (i.customId === "softban_yes") {
                await softbanUser(member, msg, interaction.user, client, reason);
            } else {
                await msg.edit({ content: `**${member.user.tag}** was not soft banned.`, embeds: [], components: [] });
            }
            collector.stop();
        });

        collector.on("end", async (_collected, reason) => {
            if (reason === "time")
                await msg.edit({
                    content: `You did not choose a response in time. **${member.user.tag}** was not soft banned.`,
                    embeds: [],
                    components: []
                });
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.reply({ content: `An error has occurred. Please try again.`, ephemeral: true });
    }
};

const softbanUser = async (member: GuildMember, message: Message, author: User, client: Client, reason: string) => {
    try {
        const msg = await message.edit({
            content: `Soft banning **${member.user.tag}**...`,
            embeds: [],
            components: []
        });

        const ban = await message.guild!.members.ban(member, { days: 7, reason });
        if (!ban)
            return msg.edit({
                content: `An error occurred. Please try again. **${member.user.tag}** was not soft banned.`,
                embeds: [],
                components: []
            });

        const unban = await message.guild!.members.unban(member, reason);
        if (!unban)
            if (!unban) {
                return msg.edit({
                    content: `An error occurred. Please try again. **${member.user.tag}** was not soft banned.`,
                    embeds: [],
                    components: []
                });
            }

        const memberObj = {
            guildID: message.guild!.id,
            userID: member.id
        };

        const softBan = {
            executor: author.id,
            timestamp: new Date().getTime(),
            reason
        };

        await memberInfo.findOneAndUpdate(memberObj, { ...memberObj, $push: { softbans: softBan } }, { upsert: true });

        msg.edit({
            content: `Successfully soft banned **${member.user.tag}** from ${message.guild!.name}.`,
            embeds: [],
            components: []
        });

        const msgEmbed = client.utils
            .createEmbed()
            .setColor(GUILD_BAN_REMOVE as ColorResolvable)
            .setAuthor({
                name: author.tag,
                iconURL: author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**Member:** ${member.user.tag}\n**Action:** Soft Ban\n**Reason:** ${reason}`)
            .setTimestamp()
            .setFooter({ text: `ID: ${member.user.id}` });
        return client.utils.sendMessageToBotLog(client, message.guild!, msgEmbed);
    } catch (e) {
        return client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
};
