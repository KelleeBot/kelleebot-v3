import { ButtonInteraction, ColorResolvable, CommandInteraction, GuildMember, Message, User } from "discord.js";
import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";
import { MUTE, GUILD_BAN_ADD } from "../../../config/embedColours.json";

const MAX_WARNINGS = 3;

export const warn = async (client: Client, interaction: CommandInteraction) => {
    const { guild, user } = interaction;
    const member = interaction.options.getMember("member", true) as GuildMember;
    const reason = interaction.options.getString("reason", true);
    const sendDM = interaction.options.getBoolean("dm") ?? false;

    try {
        if (member.user.bot) return interaction.reply({ content: "You cannot warn bots.", ephemeral: true });

        if (member.id === user.id) return interaction.reply({ content: "You cannot warn yourself.", ephemeral: true });

        if ((interaction.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) < 0)
            return interaction.reply({ content: "You cannot warn a member with a higher role than you.", ephemeral: true });

        const memberObj = { guildID: guild!.id, userID: member.id };
        const warn = {
            executor: user.id,
            timestamp: new Date().getTime(),
            reason
        }

        const result = await memberInfo.findOneAndUpdate(memberObj, { ...memberObj, $push: { warnings: warn } }, { new: true, upsert: true });
        const numWarnings = !result || result.warnings.length === 0 ? 1 : result.warnings.length;
        const ordinal = getOrdinal(numWarnings);

        if (sendDM) {
            try {
                await member.send({
                    content: `You have been warned in **${guild!.name}** for the following reason:\n\n${reason}.\n\nThis is your **${ordinal}** warning.`,
                });
            } catch (e: any) {
                client.utils.log("ERROR", __filename, `An error has occurred: ${e.message}`);
            }
        }

        const msgEmbed = client.utils
            .createEmbed()
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(MUTE as ColorResolvable)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `**Member:** ${member.user.tag}\n**Action:** Warn\n**Reason:** ${reason}\n**Number of Warnings:** \`${numWarnings}\``
            )
            .setFooter({ text: `ID: ${member.id}` })
            .setTimestamp();

        client.utils.sendMessageToBotLog(client, guild!, msgEmbed);

        const buttonRow = client.utils
            .createActionRow()
            .addComponents(
                client.utils.createButton().setCustomId("ban_yes").setLabel("Yes").setStyle("SUCCESS"),
                client.utils.createButton().setCustomId("ban_no").setLabel("No").setStyle("DANGER")
            );

        const time = 1000 * 60;
        const timestamp = `<t:${Math.floor((new Date().getTime() + time) / 1000)}:R>`;
        const text = `Successfully warned **${member.user.tag}** for ${reason}. This is their **${ordinal}** warning.${numWarnings >= MAX_WARNINGS ? `\n\nThis is now their **${ordinal}** warning. Do you want to ban them? This prompt expires ${timestamp}.` : ""}`;

        if (numWarnings >= MAX_WARNINGS) {
            const msg = await client.utils.fetchReply(interaction, { content: text, components: [buttonRow] });
            const collector = msg.createMessageComponentCollector({ componentType: "BUTTON", filter: (b) => b.user.id === interaction.user.id, time });

            collector.on("collect", async (button) => {
                if (button.customId === "ban_yes") {
                    await ban(button, member, client, numWarnings);
                } else if (button.customId === "ban_no") {
                    await button.update({
                        content: `Successfully warned **${member.user.tag}** for ${reason}. This is their **${ordinal}** warning.`,
                        components: []
                    });
                }
                collector.stop();
            });

            collector.on("end", async (_collected, reason) => {
                if (reason === "time") await msg.edit({ content: `Successfully warned **${member.user.tag}** for ${reason}. This is their **${ordinal}** warning.`, components: [] });
            });
        } else {
            return await interaction.reply({ content: text });
        }
    } catch (e: any) {
        client.utils.log("ERROR", __filename, `An error has occurred: ${e.message}`);
        return interaction.reply({ content: `An error has occurred and **${member.user.tag}** was not warned.`, ephemeral: true });
    }
}

const ban = async (button: ButtonInteraction, member: GuildMember, client: Client, numWarnings: number) => {
    const reason = `Banned due to having \`${numWarnings}\` warnings.`
    const msg = await button.update({ content: `Banning **${member.user.tag}**...`, components: [], fetchReply: true }) as Message;
    const bannedUser = await button.guild!.members.ban(member.user, { days: 7, reason });
    if (!bannedUser) return msg.edit({ content: `An error has occurred and **${member.user.tag}** was not banned.` });

    if (!(bannedUser instanceof User) || !(bannedUser instanceof GuildMember)) return;

    const memberObj = { guildID: button.guildId, userID: bannedUser.id };
    const ban = {
        executor: button.user.id,
        timestamp: new Date().getTime(),
        reason
    };

    await memberInfo.findOneAndUpdate(memberObj, { ...memberObj, $push: { bans: ban } }, { upsert: true });

    await msg.edit({ content: `Successfully banned **${member.user.tag}**.`, components: [] });

    const msgEmbed = client.utils
        .createEmbed()
        .setColor(GUILD_BAN_ADD as ColorResolvable)
        .setAuthor({
            name: button.user.tag,
            iconURL: button.user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(button.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`**Member:** ${member.user.tag}\n**Action:** Ban\n**Reason:** ${reason}`)
        .setTimestamp()
        .setFooter({ text: `ID: ${member.id}` });
    return client.utils.sendMessageToBotLog(client, button.guild!, msgEmbed);
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}