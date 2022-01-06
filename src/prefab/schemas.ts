const guild = {
  disabledCommands: [String],
  disabledChannels: [String],
  commandPerms: {},
  commandCooldowns: {},
  commandAlias: {}
};

const prefabProfile = {
  language: {
    default: "english",
    type: String
  },
  embedColor: {
    default: "DEFAULT",
    type: String
  }
};

export { guild, prefabProfile };
