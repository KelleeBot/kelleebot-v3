import { Client } from "../../util/client";
import { CommandInteraction, TextChannel } from "discord.js";

export const twitch = async (client: Client, interaction: CommandInteraction) => {
    try {
        const twitch = interaction.options.getString("twitch")!;
        const message = interaction.options.getString("message")!;
        const channel = interaction.options.getChannel("channel") as TextChannel ?? interaction.channel as TextChannel;

        if (channel.type !== "GUILD_TEXT")
            return await interaction.reply({ content: "Only text channels can be set as the Twitch notification channel.", ephemeral: true });

        if (channel.isThread())
            return await interaction.reply({ content: "Thread channels are not allowed to be set as the Twitch notification channel.", ephemeral: true });

        if (!(await doesChannelExist(client, twitch)))
            return await interaction.reply({ content: `Looks like the channel **${twitch}** doesn't exist on Twitch. Please try another channel.`, ephemeral: true });

        await client.guildInfo.findByIdAndUpdate(
            interaction.guildId!,
            {
                "streamerLive.channelID": channel?.id,
                "streamerLive.twitchChannel": twitch,
                "streamerLive.message": message
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return await interaction.reply({ content: `You have successfully set \`${twitch}\` as the Twitch go live notification.`, ephemeral: true });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};

const doesChannelExist = async (client: Client, channel: string) => {
    const exists = await client.twitchApi.getUsers(channel);
    if (!exists) return false;
    if (!exists.data.length) return false;
    return true;
};