const { EmbedBuilder } = require("discord.js");
const path = require("path");

module.exports = {
  name: "rules",
  description: "Met a jour le règlement",

  callback: async (client, interaction) => {
    const channel = await client.channels.fetch("1177932922796384330");
    const rules = Bun.file(path.join(__dirname, "..", "..", "..", "rules.txt"));

    const embed = new EmbedBuilder()
      .setColor(0xb8a7ea)
      .setDescription(await rules.text());
    channel.send({ embeds: [embed] });
  },
};
