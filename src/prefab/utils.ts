import {
    BaseCommandInteraction,
    CommandInteraction,
    GuildMember,
    InteractionReplyOptions,
    Message,
    MessageEmbed,
    PermissionString,
    MessageActionRow,
    MessageButton,
    TextBasedChannel
} from "discord.js";
import { Client } from "../util/client";
import { KelleeBotCommand } from "../util/command";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

const paginationComponents = [
    new MessageActionRow().addComponents([
        new MessageButton().setCustomId("ll").setStyle("SECONDARY").setEmoji("⏪"),
        new MessageButton().setCustomId("l").setStyle("SECONDARY").setEmoji("◀️"),
        new MessageButton().setCustomId("stop").setStyle("SECONDARY").setEmoji("⏸️"),
        new MessageButton().setCustomId("r").setStyle("SECONDARY").setEmoji("▶️"),
        new MessageButton().setCustomId("rr").setStyle("SECONDARY").setEmoji("⏩")
    ])
];
const consoleColors = {
    SUCCESS: "\u001b[32m",
    WARNING: "\u001b[33m",
    ERROR: "\u001b[31m"
};

class KelleeBotUtils {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async paginate(interaction: CommandInteraction, embeds: MessageEmbed[], options?: { time?: number }) {
        const msg = await this.fetchReply(interaction, { embeds: [embeds[0]], components: paginationComponents });

        let pageIndex = 0;
        const time = options?.time ?? 30000;
        try {
            const collector = msg.createMessageComponentCollector({ componentType: "BUTTON", filter: (b) => b.user.id === interaction.user.id, idle: time });

            collector.on("collect", async (button) => {
                if (button.customId === "rr") {
                    pageIndex = embeds.length - 1;
                } else if (button.customId === "r") {
                    if (pageIndex < embeds.length - 1) pageIndex++;
                    else pageIndex = 0;
                } else if (button.customId === "stop") {
                    collector.stop();
                    return await button.update({ components: [] });
                } else if (button.customId === "ll") {
                    pageIndex = 0;
                } else if (button.customId === "l") {
                    if (pageIndex > 0) pageIndex--;
                    else pageIndex = embeds.length - 1;
                }
                await button.update({ embeds: [embeds[pageIndex]] });
            });
        } catch (e: any) {
            this.log("ERROR", `${__filename}`, `An error has occurred: ${e.message}`);
        }
    }

    async getReply(
        channel: TextBasedChannel,
        userId: string,
        options?: { time?: number; words?: string[]; regexp?: RegExp; filter?: (msg: Message) => boolean | Promise<boolean> }
    ) {
        const time = options?.time ?? 30000;

        const msgs = await channel.awaitMessages({
            filter: async (msg) => {
                return (
                    msg.author.id === userId &&
                    (!options?.words?.length || options.words.includes(msg.content.toLowerCase())) &&
                    (!options?.regexp || options.regexp.test(msg.content)) &&
                    (!options?.filter || (await options.filter(msg)))
                );
            },
            max: 1,
            time
        });

        if (msgs.size > 0) return msgs.first();
        return;
    }

    randomRange(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    missingPermissions(member: GuildMember, perms: PermissionString[]) {
        const missingPerms = member.permissions
            .missing(perms)
            .map((str) => `\`${this.client.utils.titleCase(str.replace(/_/g, " ").toLowerCase())}\``);

        return missingPerms.length > 1 ? `${missingPerms.slice(0, -1).join(", ")} or ${missingPerms.slice(-1)[0]}` : missingPerms[0];
    }

    log(type: "SUCCESS" | "WARNING" | "ERROR", path: string, text: string) {
        const timestamp = dayjs().tz("America/Denver").format("MM-DD-YYYY HH:mm:ss");
        console.log(`\u001b[36;1m<${timestamp}>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`);
    }

    async CustomEmbed({ userID }: { userID: string }) {
        const userInfo = await this.client.profileInfo.get(userID);
        return this.client.utils.createEmbed().setColor(this.client.colors[userInfo.embedColor]);
    }

    async getCooldown(command: KelleeBotCommand, interaction: CommandInteraction) {
        let cd = command.cooldown;

        if (interaction.guildId) {
            const guildInfo = await this.client.guildInfo.get(interaction.guildId);
            if (guildInfo.commandCooldowns && guildInfo.commandCooldowns[command.name]) {
                const roles = Object.keys(guildInfo.commandCooldowns[command.name]);
                const member = await interaction.guild!.members.fetch(interaction.user.id);
                const highestRole = member.roles.cache
                    .filter((role) => roles.includes(role.id))
                    .sort((a, b) => b.position - a.position)
                    .first();
                if (highestRole) cd = guildInfo.commandCooldowns[command.name][highestRole.id] / 1000;
            }
        }

        return cd;
    }

    timeToMs(timeStr: string) {
        let values = getUnitAndNumber(timeStr);
        if (!values) return undefined;

        let ms = 0;
        try {
            for (let i = 0; i < values.length; ++i) ms += getMs(values[i].numberPart, values[i].unit);
        } catch (e) {
            return undefined;
        }

        return ms;
    }

    msToTime(time: number, options: { format?: "long" | "medium" | "short"; spaces?: boolean; unitRounding?: number; joinString?: string } = {}) {
        if (options.format === undefined || (options.format !== "short" && options.format !== "medium" && options.format !== "long"))
            options.format = "short";

        if (options.spaces === undefined) options.spaces = false;
        if (options.joinString === undefined) options.joinString = " ";

        let timeStr = "";
        let nr = 0;

        for (let i = Object.keys(timeUnitValues).length; i >= 0; --i) {
            let key = Object.keys(timeUnitValues)[i];
            if (key === "a") continue;

            let ctime = time / timeUnitValues[key];
            if (ctime >= 1) {
                if ((options.unitRounding ?? 100) < ++nr) break;

                ctime = Math.floor(ctime);
                timeStr += ctime;
                timeStr += options.spaces === true && options.format !== "short" ? " " : "";
                timeStr += fullTimeUnitNames[key][options.format] + (ctime !== 1 && options.format !== "short" ? "s" : "");
                timeStr += options.spaces === true ? options.joinString : "";
                time -= ctime * timeUnitValues[key];
            }
        }

        while (timeStr.endsWith(options.joinString)) timeStr = timeStr.slice(0, -1 * options.joinString.length);

        if (timeStr === "") return;
        else return timeStr;
    }

    async fetchReply(interaction: BaseCommandInteraction, options: InteractionReplyOptions) {
        options.fetchReply = true;
        const reply = await interaction.reply(options);
        //@ts-ignore
        return await interaction.channel!.messages.fetch(reply.id);
    }

    async replyOrEdit(interaction: BaseCommandInteraction, options: InteractionReplyOptions) {
        if (interaction.replied) await interaction.editReply(options);
        else await interaction.reply(options);
    }
}

export { KelleeBotUtils };

const timeUnits: { [x: string]: string[] } = {
    ms: ["ms", "millisecond(s)"],
    s: ["sec(s)", "second(s)"],
    min: ["minute(s)", "m", "min(s)"],
    h: ["hr(s)", "hour(s)"],
    d: ["day(s)"],
    w: ["wk(s)", "week(s)"],
    mth: ["mth(s)", "month(s)"],
    y: ["year(s)"],
    a: ["julianyear(s)"],
    dec: ["decade(s)"],
    cen: ["cent(s)", "century", "centuries"]
};

const timeUnitValues: { [x: string]: number } = {
    ms: 1,
    s: 1000,
    min: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    mth: 1000 * 60 * 60 * 24 * 30,
    y: 1000 * 60 * 60 * 24 * 365,
    a: 1000 * 60 * 60 * 24 * 365.25,
    dec: 1000 * 60 * 60 * 24 * 365 * 10,
    cen: 1000 * 60 * 60 * 24 * 365 * 100
};

const fullTimeUnitNames: { [x: string]: { [y: string]: string } } = {
    ms: { short: "ms", medium: "msec", long: "millisecond" },
    s: { short: "s", medium: "sec", long: "second" },
    min: { short: "m", medium: "min", long: "minute" },
    h: { short: "h", medium: "hr", long: "hour" },
    d: { short: "d", medium: "day", long: "day" },
    w: { short: "wk", medium: "wk", long: "week" },
    mth: { short: "mth", medium: "mo", long: "month" },
    y: { short: "y", medium: "yr", long: "year" },
    dec: { short: "dec", medium: "dec", long: "decade" },
    cen: { short: "cen", medium: "cent", long: "century" }
};

function getUnitAndNumber(timeString: string) {
    timeString = timeString.toLowerCase().replace(/ /g, "");

    let unit = timeString.replace(/[0-9.,:]/g, " ");
    let numberPart = timeString.replace(/[^0-9.,:]/g, " ").replace(",", ".");

    let units = unit.split(" ").filter((str) => str !== "");
    let numberParts = numberPart.split(" ").filter((str) => str !== "");

    units = getExactUnits(units)!;

    if (
        unit === "" ||
        unit === undefined ||
        numberPart === "" ||
        numberPart === undefined ||
        units === undefined ||
        units.length === 0 ||
        numberParts.length === 0 ||
        units.length !== numberParts.length
    )
        return undefined;

    let ans = [];
    for (let i = 0; i < units.length; ++i)
        ans.push({
            numberPart: numberParts[i],
            unit: units[i]
        });
    return ans;
}

function getExactUnits(thisUnits: string[]) {
    let exactUnits = [];

    for (let newUnit of thisUnits) {
        if (timeUnits[newUnit] !== undefined) {
            exactUnits.push(newUnit);
            continue;
        } else {
            for (let timeUnit in timeUnits) {
                for (let timeUnitAllias of timeUnits[timeUnit]) {
                    if (timeUnitAllias.replace("(s)", "") === newUnit || timeUnitAllias.replace("(s)", "s") === newUnit) {
                        exactUnits.push(timeUnit);
                        continue;
                    }
                }
            }
        }
    }

    if (exactUnits.length !== thisUnits.length) return;

    return exactUnits;
}

function getMs(number: string, unit: string) {
    if (number.includes(":")) {
        switch (unit) {
            case "min":
                return Number(number.split(":")[0]) * timeUnitValues["min"] + Number(number.split(":")[1]) * timeUnitValues["s"];
            case "h":
                return Number(number.split(":")[0]) * timeUnitValues["h"] + Number(number.split(":")[1]) * timeUnitValues["min"];
            default:
                throw new Error("Used ':' with a unit which doesn't support it");
        }
    }

    return Number(number) * timeUnitValues[unit];
}
