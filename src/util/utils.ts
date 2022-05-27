import {
    AutocompleteInteraction,
    CommandInteraction,
    Guild,
    GuildAuditLogsAction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu,
    Modal,
    Permissions,
    Snowflake,
    TextChannel
} from "discord.js";
import { ChannelTypes } from "../types/channelTypes";
import { KelleeBotUtils } from "../prefab/utils";
import memberInfo from "../schemas/memberInfo";
import { Client } from "./client";

class Utils extends KelleeBotUtils {
    constructor(client: Client) {
        super(client);
    }

    async getAutocomplete(client: Client, interaction: AutocompleteInteraction, choices: string[]) {
        const focusedValue = interaction.options.getFocused() as string;
        const filtered = choices.filter((choice) => choice.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(
            filtered.slice(0, Math.min(25, filtered.length)).map((choice) => ({
                name: this.titleCase(choice),
                value: this.titleCase(choice)
            }))
        );
    }

    async getTwitchLive(client: Client, guildID: Snowflake) {
        let twitchLiveInfo = await client.twitchLiveInfo.get(guildID);
        if (!twitchLiveInfo) {
            await client.twitchLiveInfo.findByIdAndUpdate(guildID, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        }
        return twitchLiveInfo;
    }

    async sendMessageToBotLog(client: Client, guild: Guild, msg: Message | MessageEmbed) {
        const guildInfo = await client.guildInfo.get(guild.id);
        if (!guildInfo.botLoggingChannel) return;

        const channel = client.channels.cache.get(guildInfo.botLoggingChannel) as TextChannel;
        if (!channel) return;

        const modLogWebhook = await this.getWebhook(client, channel);
        if (!modLogWebhook) return;

        return await modLogWebhook.send(msg instanceof Message ? { content: `${msg}` } : { embeds: [msg] });
    }

    async getWebhook(client: Client, channel: TextChannel) {
        const webhook = await channel.fetchWebhooks();
        const botWebhook = webhook.find((hook) => hook.owner?.id == client.user?.id);
        return !webhook || !botWebhook
            ? await channel.createWebhook(`${client.user?.username}`, { avatar: `${client.user?.displayAvatarURL({ dynamic: true })}` })
            : webhook.get(botWebhook.id);
    }

    async fetchAuditLog(guild: Guild, auditLogAction: GuildAuditLogsAction) {
        return guild.me?.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG) ? await guild.fetchAuditLogs({ limit: 1, type: auditLogAction }) : false;
    }

    async fetchMemberInfo(guildID: Snowflake, userID: Snowflake) {
        return await memberInfo.findOne({ guildID, userID });
    }

    async quickReply(client: Client, interaction: CommandInteraction, content: string) {
        const embed = (await client.utils.CustomEmbed({ userID: interaction.user.id })).setDescription(content);
        try {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        }
    }

    async doesTwitchChannelExist(client: Client, channel: string) {
        const exists = await client.twitchApi.getUsers(channel);
        if (!exists) return false;
        if (!exists.data) return false;
        if (!exists.data.length) return false;
        return true;
    }

    createEmbed() {
        return new MessageEmbed();
    }

    createButton() {
        return new MessageButton();
    }

    createActionRow() {
        return new MessageActionRow();
    }

    createSelectMenu() {
        return new MessageSelectMenu();
    }

    createModal() {
        return new Modal();
    }

    getChannelDescription(channel: ChannelTypes) {
        return `**${this.titleCase(channel.toString().replace(/_/g, " ").replace(/GUILD/g, "").toLowerCase())} Channel`;
    }

    getGuildIcon(guild: Guild) {
        return guild.iconURL({ dynamic: true }) ?? "https://i.imgur.com/XhpH3KD.png";
    }

    formatNumber(number: number) {
        return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }

    removeCommas(str: string) {
        return str.replace(/,/g, "");
    }

    isValidNumber(str: string) {
        const numberRegExp = /^(\d*\.?\d+|\d{1,3}(,\d{3})*(\.\d+)?)$/;
        return numberRegExp.test(str);
    }

    pluralize(amount: number, string: string, format = false) {
        return amount !== 1
            ? format
                ? `\`${this.formatNumber(amount)}\` ${string}s`
                : `${this.formatNumber(amount)} ${string}s`
            : format
                ? `\`${this.formatNumber(amount)}\` ${string}`
                : `${this.formatNumber(amount)} ${string}`;
    }

    titleCase(string: string) {
        return string.replace(/(^|\s)\S/g, (char) => char.toUpperCase());
    }

    chunkArray(arr: any[], size: number): any {
        return arr.length > size ? [arr.slice(0, size), ...this.chunkArray(arr.slice(size), size)] : [arr];
    }

    /**
     * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
     * @param {string} text Content to split
     * @param {SplitOptions} [options] Options controlling the behavior of the split
     * @returns {string[]}
    */
    splitMessage(text: string, { maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}) {
        if (text.length <= maxLength) return [text];
        let splitText = [text];
        if (Array.isArray(char)) {
            while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
                const currentChar = char.shift();
                if (currentChar instanceof RegExp) {
                    //@ts-ignore
                    splitText = splitText.flatMap(chunk => chunk.match(currentChar));
                } else {
                    splitText = splitText.flatMap(chunk => chunk.split(currentChar));
                }
            }
        } else {
            splitText = text.split(char);
        }

        if (splitText.some(elem => elem.length > maxLength)) throw new RangeError(`Text is longer than ${maxLength} characters.`);
        const messages = [];
        let msg = "";
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk + append).length > maxLength) {
                messages.push(msg + append);
                msg = prepend;
            }
            msg += (msg && msg !== prepend ? char : '') + chunk;
        }
        return messages.concat(msg).filter(m => m);
    }
}

export { Utils };