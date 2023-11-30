const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('path');

module.exports = async (client, member) => {
  try {
    let guild = member.guild;
    if (!guild) return;

    const canvas = Canvas.createCanvas(700, 200);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage(
      path.join(__dirname, '..', '..', '..', 'assets', 'welcome.jpeg')
    );

    ctx.drawImage(background, 0, -300);

    const pfp = await Canvas.loadImage(
      member.user.displayAvatarURL({
        format: 'jpeg',
      })
    );

    let x = 25;
    let y = canvas.height / 2 - pfp.height / 2;
    ctx.save()
    ctx.beginPath()
    ctx.arc(x * 3.55, y * 2.8, pfp.width / 2, 0, Math.PI * 2, false)
    ctx.clip()
    ctx.drawImage(pfp, x, y);
    ctx.restore();

    let text = `Bienvenue sur Junior's !`;
    x = 50 + pfp.width;
    y = canvas.height - pfp.height / 2 - 25;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Montserrat';
    ctx.fillText(text, x, y + 5);

    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'welcome.png' });

    const embed = new EmbedBuilder()
      .setColor(0xB8A7EA)
      .setTitle('Un nouveau membre est arrivé ?!')
      .setDescription(`🎉 Bienvenue ${member} ! 🎉`)
      .setImage('attachment://welcome.png');

    const channel = await client.channels.fetch('1177932922796384329');
    channel.send({ embeds: [embed], files: [attachment] });
  } catch (error) {
    console.error(`Error welcoming member: ${error}`);
  }
};
