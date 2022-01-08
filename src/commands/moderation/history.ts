import ms from "ms";
import { CommandInteraction, Util } from "discord.js";
import { Client } from "../../util/client";
import memberInfo from "../../schemas/memberInfo";

export const history = async (client: Client, interaction: CommandInteraction) => {
    const user = interaction.options.getUser("user") ??
        await client.users.fetch(interaction.options.getUser("user")!).catch(e => client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`));

    if (!user) return interaction.reply({ content: "A user was not found with that ID.", ephemeral: true });

    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
        .setAuthor({
            name: `Moderation History for ${user.tag}`,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

    const results = await memberInfo.findOne({ guildID: interaction.guildId, userID: user.id });
    if (!results) {
        msgEmbed.setDescription("This user does not have any moderation history in this server.")
        return interaction.reply({ embeds: [msgEmbed] });
    }

    let description = "";
    const { warnings, kicks, bans, unbans, softbans, mutes } = results;
    if (warnings.length) {
        description += `**❯ Warnings [${warnings.length}]**`;
        description += loopThroughInfo({ warnings });
    }

    if (kicks.length) {
        description +=
            mutes.length || warnings.length
                ? `\n**❯ Kicks [${kicks.length}]**`
                : `**❯ Kicks [${kicks.length}]**`;
        description += loopThroughInfo({ kicks });
    }

    if (bans.length) {
        description += kicks.length
            ? `\n**❯ Bans [${bans.length}]**`
            : `**❯ Bans [${bans.length}]**`;
        description += loopThroughInfo({ bans });
    }

    if (unbans.length) {
        description += bans.length
            ? `\n**❯ Unbans [${unbans.length}]**`
            : `**❯ Unbans [${unbans.length}]**`;
        description += loopThroughInfo({ unbans });
    }

    if (softbans.length) {
        description += unbans.length
            ? `\n**❯ Soft Bans [${softbans.length}]**`
            : `**❯ Soft Bans [${softbans.length}]**`;
        description += loopThroughInfo({ softbans });
    }

    if (mutes.length) {
        description += `\n**❯ Timeouts [${mutes.length}]**`;
        description += loopThroughInfo({ mutes });
    }

    const embedArray = [];
    const descArray = Util.splitMessage(description, {
        maxLength: 800,
        char: "\n\n"
    });

    if (descArray.length == 1) {
        msgEmbed.setDescription(description);
        return interaction.reply({ embeds: [msgEmbed] });
    }

    for (let i = 0; i < descArray.length; i++) {
        let desc = "";
        desc += descArray[i];
        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setAuthor({
                name: `Moderation history for ${user.tag}`,
                iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: `Requested by ${interaction.user.tag} | Page ${i + 1} of ${descArray.length
                    }`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setDescription(desc);
        embedArray.push(msgEmbed);
    }
    return client.utils.buttonPagination(interaction, embedArray, { time: 1000 * 60 * 10 });
}

const loopThroughInfo = (infoType: any) => {
    let description = "";
    let type;
    let executedType;

    if (infoType.warnings) {
        type = infoType.warnings;
        executedType = "\nWarned By: ";
    } else if (infoType.mutes) {
        type = infoType.mutes;
        executedType = "\nTimed Out By: ";
    } else if (infoType.kicks) {
        type = infoType.kicks;
        executedType = "\nKicked By: ";
    } else if (infoType.bans) {
        type = infoType.bans;
        executedType = "\nBanned By: ";
    } else if (infoType.unbans) {
        type = infoType.unbans;
        executedType = "\nUnbanned By: ";
    } else if (infoType.softbans) {
        type = infoType.softbans;
        executedType = "\nSoft Banned By: ";
    }

    for (const info of type) {
        const { executor, timestamp, reason } = info;
        const when = Math.round(timestamp / 1000);

        description += `${executedType}<@${executor}>\nWhen: <t:${when}:F>${reason ? `\nReason: ${reason}` : ""
            }${infoType.mutes ? `\nDuration: ${ms(info.duration, { long: true })}` : ""
            }\n`;
    }
    return description;
};