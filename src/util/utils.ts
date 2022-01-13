import { AutocompleteInteraction, CommandInteraction, Guild, GuildAuditLogsAction, GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, Permissions, Snowflake, TextChannel } from "discord.js";
import { ChannelTypes } from "../types/channelTypes";
import { KelleeBotUtils } from "../prefab/utils";
import memberInfo from "../schemas/memberInfo";
import { Client } from "./client";

const buttons = ["⬅️", "⛔", "➡️"];

class Utils extends KelleeBotUtils {
  constructor(client: Client) {
    super(client);
  }

  async getAutocomplete(client: Client, interaction: AutocompleteInteraction, choices: string[]) {
    const focusedValue = interaction.options.getFocused() as string;
    const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedValue.toLowerCase())
    );
    await interaction.respond(
      filtered.slice(0, Math.min(25, filtered.length)).map((choice) => ({
        name: client.utils.titleCase(choice),
        value: client.utils.titleCase(choice)
      }))
    );
  };

  async getTwitchLive(client: Client, guildID: Snowflake) {
    let twitchLiveInfo = await client.twitchLiveInfo.get(guildID);
    if (!twitchLiveInfo) {
      await client.twitchLiveInfo.findByIdAndUpdate(
        guildID,
        {},
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
    return twitchLiveInfo;
  }

  async sendMessageToBotLog(client: Client, guild: Guild, msg: Message | MessageEmbed) {
    const guildInfo = await client.guildInfo.get(guild.id);
    if (!guildInfo.botLoggingChannel) return;

    const channel = client.channels.cache.get(guildInfo.botLoggingChannel) as TextChannel;
    if (!channel) return;

    const modLogWebhook = await this.getWebhook(client, channel);
    if (!modLogWebhook) return

    return await modLogWebhook.send(msg instanceof Message ? { content: `${msg}` } : { embeds: [msg] });
  }

  async getWebhook(client: Client, channel: TextChannel) {
    const webhook = await channel.fetchWebhooks();
    const botWebhook = webhook.find((hook) => hook.owner?.id == client.user?.id);
    return !webhook || !botWebhook
      ? await channel.createWebhook(`${client.user?.username}`, { avatar: `${client.user?.displayAvatarURL({ dynamic: true })}` })
      : webhook.get(botWebhook.id);
  }

  async buttonPagination(interaction: CommandInteraction, embeds: MessageEmbed[], options?: { time: number }) {
    try {
      let time = 30000; // 30 seconds
      if (options) {
        if (options.time) time = options.time
      }

      const msgButtons: MessageButton[] = [];
      for (let i = 0; i < buttons.length; i++) {
        msgButtons.push(
          new MessageButton()
            .setLabel(buttons[i])
            .setCustomId(buttons[i])
            .setStyle("PRIMARY")
        );
      }

      const row = new MessageActionRow().addComponents(msgButtons);
      const pageMsg = await interaction.channel?.send({ embeds: [embeds[0]], components: [row] }) as Message

      let pageIndex = 0;

      const collector = pageMsg.createMessageComponentCollector({ componentType: "BUTTON", time });
      collector.on("collect", async (i) => {
        try {
          await i.deferUpdate();
          if ((i.member as GuildMember).id !== interaction.user.id)
            return i.reply({
              content: `This is locked to **${(interaction.member as GuildMember).user.tag}**.`,
              ephemeral: true
            })

          if (i.customId === "➡️") {
            if (pageIndex < embeds.length - 1) {
              pageIndex++;
              await pageMsg.edit({ embeds: [embeds[pageIndex]] });
            } else {
              pageIndex = 0;
              await pageMsg.edit({ embeds: [embeds[pageIndex]] });
            }
          } else if (i.customId === "⛔") {
            collector.stop();
          } else if (i.customId === "⬅️") {
            if (pageIndex > 0) {
              pageIndex--;
              await pageMsg.edit({ embeds: [embeds[pageIndex]] });
            } else {
              pageIndex = embeds.length - 1;
              await pageMsg.edit({ embeds: [embeds[pageIndex]] });
            }
          }
        } catch (e) {
          return this.client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}.`);
        }
      });

      collector.on("end", async () => {
        try {
          msgButtons.forEach((button) => {
            button.setDisabled(true);
            return button;
          });

          await pageMsg.edit({ components: [new MessageActionRow().addComponents(msgButtons)] });
        } catch (e) {
          this.client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        }
      });
    } catch (e) {
      return this.client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
  }

  async fetchAuditLog(guild: Guild, auditLogAction: GuildAuditLogsAction) {
    return guild.me?.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)
      ? await guild.fetchAuditLogs({ limit: 1, type: auditLogAction })
      : false;
  }

  async fetchMemberInfo(guildID: Snowflake, userID: Snowflake) {
    return await memberInfo.findOne({ guildID, userID });
  }

  async quickReply(client: Client, interaction: CommandInteraction, content: string) {
    const embed = (await client.utils.CustomEmbed({ userID: interaction.user.id })).setDescription(content);

    try {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      client.utils.log("ERROR", `${__filename}`, 'An error has occurred: ${e}');
    }
  }

  getChannelDescription(channel: ChannelTypes) {
    return `**${this.titleCase(channel.toString().replace(/_/g, " ").replace(/GUILD/g, "").toLowerCase())} Channel`;
  }

  getGuildIcon(guild: Guild) {
    return guild.iconURL()
      ? guild.iconURL({ dynamic: true })
      : "https://i.imgur.com/XhpH3KD.png";
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

  pluralize(amount: number, string: string, format?: boolean) {
    return amount !== 1
      ? format ? `\`${this.formatNumber(amount)}\` ${string}s` : `${this.formatNumber(amount)} ${string}s`
      : format ? `\`${this.formatNumber(amount)}\` ${string}` : `${this.formatNumber(amount)} ${string}`;
  }

  titleCase(string: string) {
    return string.replace(/(^|\s)\S/g, (char) => char.toUpperCase());
  }

  chunkArray(arr: any[], size: number): any {
    return arr.length > size ? [arr.slice(0, size), ...this.chunkArray(arr.slice(size), size)] : [arr];
  }
}

export { Utils };
