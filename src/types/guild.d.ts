declare interface Guild {
  _id: string;
  settings: {
    disabledCommands: string[];
    disabledChannels: string[];
    commandPerms: any;
    commandCooldowns: any;
    commandAlias: any;
  };
}

export { Guild };
