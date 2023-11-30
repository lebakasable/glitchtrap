const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  callback: async (client, interaction) => {
    const announce = interaction.options.get("announce").value;
    const channel = await client.channels.fetch("1177932922796384331");

    const embed = new EmbedBuilder()
      .setColor(0xb8a7ea)
      .setTitle(announce)
      .setDescription("@everyone");
    channel.send({ embeds: [embed] });

    interaction.reply({ content: "Annonce créée !", ephemeral: true });
  },

  name: "announce",
  description: "Créer une annonce",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "announce",
      description: "L'annonce à annoncer",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};
