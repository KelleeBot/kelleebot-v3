import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import * as locale from "../../../config/locale.json";

export const guild = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();

    const { guild, user } = interaction;
    const { name, premiumSubscriptionCount, partnered } = guild!;
    const premiumTier = guild!.premiumTier === "NONE" ? "0" : guild!.premiumTier.replace("TIER_", "");

    const members = await guild!.members.fetch();

    const guildOwner = await guild!.fetchOwner();
    const totalMembers = members.filter((member) => !member.user.bot).size;
    const onlineMembers = members.filter((member) => !member.user.bot).filter((member) => member.presence !== null && member.presence.status !== "offline").size;
    const bots = members.filter((member) => member.user.bot).size;
    const onlineBots = members.filter((member) => member.user.bot).filter((member) => member.presence !== null && member.presence.status !== "offline").size;

    const categories = guild!.channels.cache.filter((c) => c.type === "GUILD_CATEGORY").size;
    const textChannels = guild!.channels.cache.filter((c) => c.type === "GUILD_TEXT").size;
    const voiceChannels = guild!.channels.cache.filter((c) => c.type === "GUILD_VOICE").size;

    const roleCount = guild!.roles.cache.size - 1;
    const createdTimestamp = Math.floor(guild!.createdTimestamp / 1000);

    const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
        .setAuthor({ name, iconURL: client.utils.getGuildIcon(guild!) })
        .setThumbnail(client.utils.getGuildIcon(guild!))
        .setTimestamp()
        .setFooter({
            text: `Requested by ${user.tag}`,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .addFields(
            {
                name: "**Created**",
                value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
                inline: false
            },
            {
                name: "**Server Owner**",
                value: guildOwner!.user.tag,
                inline: true
            },
            {
                name: "**Total Members + Bots**",
                value: `${guild!.members.cache.size} Members + Bots`,
                inline: true
            },
            {
                name: "**Members**",
                value: `${client.utils.pluralize(totalMembers, "member")} (${onlineMembers} Online)`,
                inline: true
            },
            {
                name: "**Bots**",
                value: `${client.utils.pluralize(bots, "bot")} (${onlineBots} Online)`,
                inline: true
            },
            {
                name: "**Boosts**",
                value: `${client.utils.pluralize(premiumSubscriptionCount ?? 0, "boost")} (Tier ${premiumTier})`,
                inline: true
            },
            {
                name: "**Guild Locale**",
                //@ts-ignore
                value: locale[interaction.guildLocale],
                inline: true
            },
            {
                name: "**Categories**",
                value: `${categories}`,
                inline: true
            },
            {
                name: "**Text Channels**",
                value: `${textChannels}`,
                inline: true
            },
            {
                name: "**Voice Channels**",
                value: `${voiceChannels}`,
                inline: true
            },
            {
                name: "**Roles**",
                value: `${roleCount}`,
                inline: true
            },
            {
                name: "**Emotes**",
                value: `${guild!.emojis.cache.size}`,
                inline: true
            },
            {
                name: "**Partnered**",
                value: `${partnered ? "Yes" : "No"}`,
                inline: true
            },
            {
                name: "**Server ID**",
                value: guild!.id,
                inline: true
            }
        );
    return interaction.editReply({ embeds: [msgEmbed] });
};