import { ColorResolvable, CommandInteraction, GuildMember } from "discord.js";
import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";
import { MUTE } from "../../../config/embedColours.json";

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
        if (sendDM) {
            try {
                await member.send({
                    content: `You have been warned in **${guild!.name}** for the following reason:\n\n${reason}.\n\nThis is your **${getOrdinal(!result || result.warnings.length === 0 ? 1 : result.warnings.length)}** warning.`,
                });
            } catch (e: any) {
                client.utils.log("ERROR", __filename, `An error has occurred: ${e}`);
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
                `**Member:** ${member.user.tag}\n**Action:** Warn\n**Reason:** ${reason}\n**Number of Warnings:** \`${!result || result.warnings.length === 0 ? 1 : result.warnings.length}\``
            )
            .setFooter({ text: `ID: ${member.id}` })
            .setTimestamp();

        client.utils.sendMessageToBotLog(client, guild!, msgEmbed);
        return interaction.reply({
            content: `Successfully warned **${member.user.tag}** for ${reason}. This is their \`${getOrdinal(!result || result.warnings.length === 0 ? 1 : result.warnings.length)}\` warning.`
        });
    } catch (e: any) {
        client.utils.log("ERROR", __filename, `An error has occurred: ${e}`);
        return interaction.reply({ content: `An error has occurred and **${member.user.tag}** was not warned.`, ephemeral: true });
    }
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}