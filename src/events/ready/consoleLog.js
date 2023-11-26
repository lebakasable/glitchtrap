const { ActivityType } = require('discord.js');

module.exports = (client) => {
  console.log(`${client.user.tag} is online.`);

  client.user.setPresence({
    activities: [{
      name: 'kidnapper des enfants',
      type: ActivityType.Playing,
    }],
    status: 'online',
  });
};
