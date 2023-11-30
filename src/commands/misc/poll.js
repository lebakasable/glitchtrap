const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  callback: async (client, interaction) => {
    const question = interaction.options.get("question").value;
    const channel = await client.channels.fetch("1177932922796384332");

    const embed = new EmbedBuilder().setColor(0xb8a7ea).setTitle(question);
    channel.send({ embeds: [embed] }).then((message) => {
      message.react("👍");
      message.react("👎");
    });

    interaction.reply({ content: "Sondage creé !", ephemeral: true });
  },

  name: "poll",
  description: "Créer un sondage",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: "question",
      description: "La question du sondage",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};
