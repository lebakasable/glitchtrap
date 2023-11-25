const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const AutoRole = require('../../models/AutoRole');

module.exports = {
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply("Autorole n'a pas été configuré pour ce serveur. Utilisez `/autorole-configure` pour le configurer.");
        return;
      }

      await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply('Autorole a été désactivé pour ce serveur. Utilisez `/autorole-configure` pour le réactiver.');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'autorole-disable',
  description: 'Désactive Autorole pour ce serveur',
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
