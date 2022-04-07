import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";
import {
    ButtonInteraction,
    ColorResolvable,
    CommandInteraction,
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    User
} from "discord.js";
import { GUILD_BAN_ADD, GUILD_MEMBER_EVENTS } from "../../../config/embedColours.json";

export const kick = async (client: Client, interaction: CommandInteraction) => {
    const member = interaction.options.getMember("member")! as GuildMember;
    const reason = interaction.options.getString("reason")!;

    if (member.id === interaction.user.id) return interaction.reply({ content: "Now why would you want to do that?", ephemeral: true });

    if (!member.kickable || !member.manageable || !member.moderatable)
        return interaction.reply({ content: "I don't have permissions to kick that member.", ephemeral: true });

    if ((interaction.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) < 0)
        return interaction.reply({ content: "You can't kick a member with a higher role than you.", ephemeral: true });

    try {
        const memberInfo = await client.utils.fetchMemberInfo(interaction.guildId!, member.id);
        const memberInfoEmbed = new MessageEmbed()
            .setColor(GUILD_BAN_ADD as ColorResolvable)
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) });

        const buttonRow = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("kick_yes").setLabel("Yes").setStyle("SUCCESS"),
            new MessageButton().setCustomId("kick_no").setLabel("No").setStyle("DANGER")
        );

        if (!memberInfo) {
            memberInfoEmbed.setDescription(`• Warns: 0\n• Mutes: 0\n• Kicks: 0\n• Bans: 0\n• Soft Bans: 0\n• Unbans: 0\n`);
        } else {
            const { bans, kicks, warnings, softbans, unbans, mutes } = memberInfo;
            memberInfoEmbed.setDescription(
                `• Warns: ${warnings.length}\n• Mutes: ${mutes.length}\n• Kicks: ${kicks.length}\n• Bans: ${bans.length}\n• Soft Bans: ${softbans.length}\n• Unbans: ${unbans.length}\n`
            );
        }

        const msg = (await interaction.reply({
            content: `Are you sure you want to kick **${member.user.tag}** for ${reason}?`,
            embeds: [memberInfoEmbed],
            components: [buttonRow],
            fetchReply: true
        })) as Message;

        const filter = async (i: ButtonInteraction) => {
            await i.deferUpdate();
            return (i.customId == "kick_yes" || i.customId == "kick_no") && i.user.id == interaction.user.id;
        };
        const collector = msg.createMessageComponentCollector({ filter, componentType: "BUTTON", time: 1000 * 15 });
        collector.on("collect", async (i) => {
            if (i.customId === "kick_yes") {
                await kickMember(member, msg, interaction.user, client, reason);
            } else {
                await msg.edit({
                    content: `**${member.user.tag}** was not kicked.`,
                    embeds: [],
                    components: []
                });
            }
            collector.stop();
        });

        collector.on("end", async (_collected, reason) => {
            if (reason === "time") {
                await msg.edit({
                    content: `You did not choose a response in time. **${member.user.tag}** was not kicked.`,
                    embeds: [], // Delete the embed from the message
                    components: [] // Delete the buttons from the message
                });
            }
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.reply({
            content: `An error has occurred and **${member.user.tag}** was not kicked. Please try again.`,
            ephemeral: true
        });
    }
};

const kickMember = async (member: GuildMember, message: Message, author: User, client: Client, reason: string) => {
    const msg = await message.edit({ content: `Kicking **${member.user.tag}**...`, embeds: [], components: [] });

    const kickedMember = await member.kick(reason);
    if (!kickedMember)
        return msg.edit({ content: `There was an error and **${member.user.tag}** was not kicked. Please try again.`, embeds: [], components: [] });

    const memberObj = {
        guildID: message.guild!.id,
        userID: kickedMember.id
    };

    const kick = {
        executor: author.id,
        timestamp: new Date().getTime(),
        reason
    };

    await memberInfo.findOneAndUpdate(memberObj, { ...memberObj, $push: { kicks: kick } }, { upsert: true });

    await msg.edit({ content: `Successfully kicked **${kickedMember.user.tag}** from the server.`, embeds: [], components: [] });
    const msgEmbed = new MessageEmbed()
        .setColor(GUILD_MEMBER_EVENTS as ColorResolvable)
        .setAuthor({
            name: author.tag,
            iconURL: author.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(kickedMember.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`**Member:** ${kickedMember.user.tag}\n**Action:** Kick\n**Reason:** ${reason}`)
        .setTimestamp()
        .setFooter({ text: `ID: ${kickedMember.id}` });

    return client.utils.sendMessageToBotLog(client, message.guild!, msgEmbed);
};
