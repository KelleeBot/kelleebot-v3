import { ColorResolvable, CommandInteraction, GuildMember, GuildMemberRoleManager, Message, MessageEmbed } from "discord.js";
import ms from "ms";
import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";
import { MUTE } from "../../../config/embedColours.json";

const MIN_DURATION = 1000 * 60 * 60 * 3; // Minimum of 3 hours

export const timeout = async (client: Client, interaction: CommandInteraction) => {
    const { guild, user } = interaction;
    const member = interaction.options.getMember("member")! as GuildMember;
    const duration = interaction.options.getString("duration")!;
    const reason = interaction.options.getString("reason")!;
    const sendDM = interaction.options.getBoolean("dm") ?? false;

    if (member.user.bot) return interaction.reply({ content: "Bots cannot be timed out.", ephemeral: true });

    if (isNaN(ms(duration))) return interaction.reply({ content: "Please specify a valid duration.", ephemeral: true });

    if (ms(duration) < MIN_DURATION) return interaction.reply({ content: `Duration must be at least ${ms(MIN_DURATION)}.`, ephemeral: true });

    if (member.id === user.id) return interaction.reply({ content: "Nice try. Why would you time yourself out?", ephemeral: true });

    if ((interaction.member?.roles as GuildMemberRoleManager).highest.comparePositionTo(member.roles.highest) < 0)
        return interaction.reply({ content: "You cannot time out that member.", ephemeral: true });

    if (!member.manageable || !member.moderatable)
        return interaction.reply({ content: "I do not have the permissions to timeout that member.", ephemeral: true });

    // Member is already timed out
    if (member.isCommunicationDisabled())
        return interaction.reply({
            content: `That member is already timed out. Their timeout will expire <t:${Math.round(
                member.communicationDisabledUntilTimestamp / 1000
            )}:R>.`,
            ephemeral: true
        });

    const msg = (await interaction.reply({
        content: `Timing out **${member.user.tag}**...`,
        fetchReply: true
    })) as Message;
    try {
        const timedoutMember = await member
            .timeout(ms(duration), reason)
            .catch((e) => client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`));

        if (!timedoutMember) return msg.edit({ content: `An error has occurred and **${member.user.tag}** was not timed out.` });

        const memberObj = {
            guildID: guild!.id,
            userID: timedoutMember.id
        };

        const mute = {
            executor: user.id,
            timestamp: new Date().getTime(),
            duration: ms(duration),
            reason
        };

        await memberInfo.findOneAndUpdate(
            memberObj,
            {
                ...memberObj,
                $push: {
                    mutes: mute
                }
            },
            { upsert: true }
        );

        const expirationTimestamp = `<t:${Math.round(timedoutMember.communicationDisabledUntilTimestamp! / 1000)}:R>`;

        if (sendDM) {
            try {
                await timedoutMember.send({
                    content: `You have been timed out from **${guild!.name}** for **${ms(ms(duration), {
                        long: true
                    })}**.\n\nReason: **${reason}**\n\nYour timeout will expire ${expirationTimestamp}.\n\nIf you believe this is a mistake, please contact a staff member.`
                });
            } catch (e) {
                client.utils.log("ERROR", __filename, `An error has occurred: ${e}`);
            }
        }

        const msgEmbed = new MessageEmbed()
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setColor(MUTE as ColorResolvable)
            .setThumbnail(timedoutMember.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `**Member:** ${timedoutMember.user.tag}\n**Action:** Timeout\n**Duration:** ${ms(ms(duration), {
                    long: true
                })}\n**Expiration:** ${expirationTimestamp}\n**Reason:** ${reason}`
            )
            .setFooter({ text: `ID: ${timedoutMember.id}` })
            .setTimestamp();

        client.utils.sendMessageToBotLog(client, guild!, msgEmbed);

        return msg.edit({
            content: `**${timedoutMember.user.tag}** has successfully been timed out for ${ms(ms(duration), {
                long: true
            })}. Their timeout will expire ${expirationTimestamp}.`
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return msg.edit({ content: `An error has occurred and **${member.user.tag}** was not timed out. Please try again.` });
    }
};
