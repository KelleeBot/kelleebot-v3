export const guildSettings = {
  disabledCommands: [String],
  disabledChannels: [String],
  commandPerms: {},
  commandCooldowns: {},
  commandAlias: {}
};

export const userProfile = {
  language: {
    default: "english",
    type: String
  },
  embedColor: {
    default: "DEFAULT",
    type: String
  }
};
