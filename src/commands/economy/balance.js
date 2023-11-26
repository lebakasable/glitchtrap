const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  callback: async (_client, interaction) => {
    if (!interaction.inGuild()) return;

    const targetUserId = interaction.options.get('user')?.value || interaction.member.id;

    await interaction.deferReply();

    const user = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });

    if (!user) {
      interaction.editReply(`<@${targetUserId}> n'a pas encore de profile.`);
      return;
    }

    interaction.editReply(
      targetUserId === interaction.member.id
        ? `Votre solde est **${user.balance}** fazcoins.`
        : `Le solde de <@${targetUserId}> est de **${user.balance}** fazcoins.`
    );
  },

  name: 'balance',
  description: "Voir votre solde ou celui d'un membre",
  options: [
    {
      name: 'user',
      description: "L'utilisateur dont vous voulez voir le solde",
      type: ApplicationCommandOptionType.User,
    },
  ],
};
