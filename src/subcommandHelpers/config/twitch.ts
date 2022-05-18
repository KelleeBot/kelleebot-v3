import { Client } from "../../util/client";
import { CommandInteraction, MessageActionRow, ModalActionRowComponent, TextInputComponent } from "discord.js";
import { TextInputStyles } from "discord.js/typings/enums";

export const twitch = async (client: Client, interaction: CommandInteraction) => {
    try {
        const guildInfo = await client.guildInfo.get(interaction.guildId!);

        const modal = client.utils.createModal().setCustomId("twitch").setTitle("Twitch Notification")
        const twitchChannel = new TextInputComponent()
            .setCustomId("twitchChannelInput")
            .setLabel("Twitch Channel")
            .setStyle(TextInputStyles.SHORT)
            .setRequired(true);

        if (guildInfo.streamerLive && JSON.stringify(guildInfo.streamerLive) !== "{}") twitchChannel.setValue(guildInfo.streamerLive.twitchChannel);
        else twitchChannel.setValue("Twitch Channel")

        const goLiveMessage = new TextInputComponent()
            .setCustomId("liveMessageInput")
            .setLabel("Go Live Message")
            .setStyle(TextInputStyles.PARAGRAPH)
            .setRequired(true);

        if (guildInfo.streamerLive && JSON.stringify(guildInfo.streamerLive) !== "{}") goLiveMessage.setValue(guildInfo.streamerLive.message);
        else goLiveMessage.setValue("Some placeholders to use:\n{GUILD_NAME} - Server Name\n{STREAMER} - Streamer\n{STREAM_TITLE} - Stream Title\n{GAME} - Game");

        const firstRow = new MessageActionRow<ModalActionRowComponent>().addComponents(twitchChannel);
        const secondRow = new MessageActionRow<ModalActionRowComponent>().addComponents(goLiveMessage);

        modal.addComponents(firstRow, secondRow);
        await interaction.showModal(modal);
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};
