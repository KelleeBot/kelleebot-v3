import { ButtonInteraction, ColorResolvable, CommandInteraction, Message, Snowflake, User } from "discord.js";
import { Client } from "../../util/client";
import { GUILD_BAN_REMOVE } from "../../../config/embedColours.json";
import memberInfo from "../../schemas/memberInfo";

export const unban = async (client: Client, interaction: CommandInteraction) => {
    const userID = interaction.options.getString("id")! as Snowflake;
    const reason = interaction.options.getString("reason")!;

    const guildBans = await interaction.guild!.bans.fetch();
    if (!guildBans.size) return interaction.reply({ content: "This server doesn't have anyone banned.", ephemeral: true });

    const bannedMember = guildBans.find((ban) => ban.user.id === userID);
    if (!bannedMember) return interaction.reply({ content: "This user is currently not banned from this server.", ephemeral: true });

    try {
        const memberInfo = await client.utils.fetchMemberInfo(interaction.guildId!, bannedMember.user.id);
        const memberInfoEmbed = client.utils
            .createEmbed()
            .setColor(GUILD_BAN_REMOVE as ColorResolvable)
            .setAuthor({
                name: bannedMember.user.tag,
                iconURL: bannedMember.user.displayAvatarURL({ dynamic: true })
            });

        const buttonRow = client.utils
            .createActionRow()
            .addComponents(
                client.utils.createButton().setCustomId("unban_yes").setLabel("Yes").setStyle("SUCCESS"),
                client.utils.createButton().setCustomId("unban_no").setLabel("No").setStyle("DANGER")
            );

        if (!memberInfo) {
            memberInfoEmbed.setDescription(`• Warns: 0\n• Mutes: 0\n• Kicks: 0\n• Bans: 0\n• Soft Bans: 0\n• Unbans: 0\n`);
        } else {
            const { bans, warnings, kicks, unbans, softbans, mutes } = memberInfo;
            memberInfoEmbed.setDescription(
                `• Warns: ${warnings.length}\n• Mutes: ${mutes.length}\n• Kicks: ${kicks.length}\n• Bans: ${bans.length}\n• Soft Bans: ${softbans.length}\n• Unbans: ${unbans.length}\n`
            );
        }

        const msg = await client.utils.fetchReply(interaction, { content: `Are you sure you want to unban **${bannedMember.user.tag}** for ${reason}?`, embeds: [memberInfoEmbed], components: [buttonRow] });
        if (!msg) return interaction.reply({ content: `An error has occurred and **${bannedMember.user.tag}** was not unbanned. Please try again.`, ephemeral: true });

        const filter = async (i: ButtonInteraction) => {
            await i.deferUpdate();
            return (i.customId == "unban_yes" || i.customId == "unban_no") && i.user.id == interaction.user.id;
        };

        const collector = msg.createMessageComponentCollector({ filter, componentType: "BUTTON", time: 1000 * 15 });
        collector.on("collect", async (button) => {
            if (button.customId === "unban_yes") {
                await unbanUser(bannedMember.user, button, client, reason);
            } else {
                await button.editReply({ content: `**${bannedMember.user.tag}** was not unbanned.`, embeds: [], components: [] });
            }
            collector.stop();
        });

        collector.on("end", async (_collected, reason) => {
            if (reason === "time") await msg.edit({ content: `You did not choose a response in time. **${bannedMember.user.tag}** was not unbanned.`, embeds: [], components: [] });
        });
    } catch (e: any) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e.message}`);
        return interaction.reply({ content: `An error has occurred and **${bannedMember.user.tag}** was not unbanned. Please try again.`, ephemeral: true });
    }
};

const unbanUser = async (bannedUser: User, button: ButtonInteraction, client: Client, reason: string) => {
    const unbanMsg = await button.editReply({ content: `Unbanning **${bannedUser.tag}**...` }) as Message;
    const user = await button.guild!.members.unban(bannedUser, reason);

    if (!user) return await unbanMsg.edit({ content: `There was an error and **${bannedUser.tag}** was not unbanned. Please try again.` });

    const memberObj = { guildID: unbanMsg.guildId, userID: user.id };

    const unban = {
        executor: button.user.id,
        timestamp: new Date().getTime(),
        reason
    };

    await memberInfo.findOneAndUpdate(memberObj, { ...memberObj, $push: { unbans: unban } }, { upsert: true });

    await unbanMsg.edit({ content: `Successfully unbanned **${user.tag}**.`, embeds: [], components: [] });

    const msgEmbed = client.utils
        .createEmbed()
        .setColor(GUILD_BAN_REMOVE as ColorResolvable)
        .setAuthor({
            name: button.user.tag,
            iconURL: button.user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(`**Member:** ${user.tag}\n**Action:** Unban\n**Reason:** ${reason}`)
        .setTimestamp()
        .setFooter({ text: `ID: ${user.id}` });
    return client.utils.sendMessageToBotLog(client, unbanMsg.guild!, msgEmbed);
};