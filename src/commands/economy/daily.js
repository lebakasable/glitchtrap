const { Client, Interaction } = require('discord.js');
const User = require('../../models/User');

const dailyAmount = 1000;

module.exports = {
  name: 'daily',
  description: 'Collecte ta récompense journalière',
  callback: async (_client, interaction) => {
    if (!interaction.inGuild()) return;

    try {
      await interaction.deferReply();

      const query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);

      if (user) {
        const lastDailyDate = user.lastDaily.toDateString();
        const currentDate = new Date().toDateString();

        if (lastDailyDate === currentDate) {
          interaction.editReply(
            `Vous avez déja récupéré votre récompense aujourd'hui. Revenez demain !`
          );
          return;
        }

        user.lastDaily = new Date();
      } else {
        user = new User({
          ...query,
          lastDaily: new Date(),
        });
      }

      user.balance += dailyAmount;
      await user.save();

      interaction.editReply(
        `**${dailyAmount} fazcoins** ont été ajouté a votre solde. Votre nouveau solde est de **${user.balance} fazcoins**.`
      );
    } catch (error) {
      console.error(`Error with /daily: ${error}`);
    }
  },
};
