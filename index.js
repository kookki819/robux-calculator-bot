require("dotenv").config();

const http = require("http");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField
} = require("discord.js");

// =====================================================
// HTTP SERVER สำหรับ Render
// =====================================================

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  res.end("💰 Robux Calculator Bot is online!");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// =====================================================
// DISCORD CLIENT
// =====================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =====================================================
// BOT READY
// =====================================================

client.once("ready", () => {
  console.log(`💰 บอทคำนวณออนไลน์แล้ว: ${client.user.tag}`);
});

// =====================================================
// CALCULATOR PANEL
// =====================================================

function createCalculatorPanel() {
  const embed = new EmbedBuilder()
    .setTitle("🧮 เครื่องคำนวณ Robux")
    .setDescription(
      [
        "เลือกประเภทที่ต้องการคำนวณด้านล่างได้เลย",
        "",
        "💎 **Robux → บาท**",
        "• ต่ำกว่า 2,000R → ÷ 3.1",
        "• 2,000R ขึ้นไป → ÷ 4",
        "",
        "💰 **บาท → Robux**",
        "• ต่ำกว่า 500 บาท → × 3.1",
        "• 500 บาทขึ้นไป → × 4",
        "",
        "กดปุ่มด้านล่างเพื่อคำนวณ ✨"
      ].join("\n")
    )
    .setFooter({
      text: "Robux Calculator"
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("robux_to_baht")
      .setLabel("Robux → บาท")
      .setEmoji("💎")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("baht_to_robux")
      .setLabel("บาท → Robux")
      .setEmoji("💰")
      .setStyle(ButtonStyle.Success)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

// =====================================================
// INTERACTIONS
// =====================================================

client.on("interactionCreate", async (interaction) => {
  try {

    // =================================================
    // /setup-calculator
    // =================================================

    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "setup-calculator") {

        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.Flags.Administrator
          )
        ) {
          await interaction.reply({
            content: "❌ คำสั่งนี้ใช้ได้เฉพาะแอดมิน",
            ephemeral: true
          });

          return;
        }

        await interaction.channel.send(
          createCalculatorPanel()
        );

        await interaction.reply({
          content: "✅ สร้างแผงคำนวณเรียบร้อยแล้ว",
          ephemeral: true
        });

        return;
      }
    }

    // =================================================
    // BUTTONS
    // =================================================

    if (interaction.isButton()) {

      // -----------------------------------------------
      // Robux → บาท
      // -----------------------------------------------

      if (interaction.customId === "robux_to_baht") {

        const modal = new ModalBuilder()
          .setCustomId("modal_robux_to_baht")
          .setTitle("💎 Robux → บาท");

        const input = new TextInputBuilder()
          .setCustomId("robux_amount")
          .setLabel("จำนวน Robux")
          .setPlaceholder("เช่น 1000")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );

        await interaction.showModal(modal);

        return;
      }

      // -----------------------------------------------
      // บาท → Robux
      // -----------------------------------------------

      if (interaction.customId === "baht_to_robux") {

        const modal = new ModalBuilder()
          .setCustomId("modal_baht_to_robux")
          .setTitle("💰 บาท → Robux");

        const input = new TextInputBuilder()
          .setCustomId("baht_amount")
          .setLabel("จำนวนเงินบาท")
          .setPlaceholder("เช่น 500")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );

        await interaction.showModal(modal);

        return;
      }
    }

    // =================================================
    // MODAL RESULTS
    // =================================================

    if (interaction.isModalSubmit()) {

      // -----------------------------------------------
      // Robux → บาท
      // -----------------------------------------------

      if (interaction.customId === "modal_robux_to_baht") {

        const raw = interaction.fields
          .getTextInputValue("robux_amount")
          .replace(/,/g, "")
          .trim();

        const robux = Number(raw);

        if (!Number.isFinite(robux) || robux <= 0) {

          await interaction.reply({
            content: "❌ กรุณากรอกจำนวน Robux ให้ถูกต้อง",
            ephemeral: true
          });

          return;
        }

        const rate = robux >= 2000 ? 4 : 3.1;
        const baht = Math.round(robux / rate);

        const embed = new EmbedBuilder()
          .setTitle("💎 ผลการคำนวณ")
          .addFields(
            {
              name: "💎 Robux",
              value: `${robux.toLocaleString()} Robux`,
              inline: true
            },
            {
              name: "📊 เรท",
              value: `${rate}`,
              inline: true
            },
            {
              name: "💰 ได้เงิน",
              value: `**${baht.toLocaleString()} บาท**`
            }
          );

        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });

        return;
      }

      // -----------------------------------------------
      // บาท → Robux
      // -----------------------------------------------

      if (interaction.customId === "modal_baht_to_robux") {

        const raw = interaction.fields
          .getTextInputValue("baht_amount")
          .replace(/,/g, "")
          .trim();

        const baht = Number(raw);

        if (!Number.isFinite(baht) || baht <= 0) {

          await interaction.reply({
            content: "❌ กรุณากรอกจำนวนเงินให้ถูกต้อง",
            ephemeral: true
          });

          return;
        }

        const rate = baht >= 500 ? 4 : 3.1;
        const robux = Math.round(baht * rate);

        const embed = new EmbedBuilder()
          .setTitle("💰 ผลการคำนวณ")
          .addFields(
            {
              name: "💰 เงิน",
              value: `${baht.toLocaleString()} บาท`,
              inline: true
            },
            {
              name: "📊 เรท",
              value: `${rate}`,
              inline: true
            },
            {
              name: "💎 ได้ Robux",
              value: `**${robux.toLocaleString()} Robux**`
            }
          );

        await interaction.reply({
          embeds: [embed],
          ephemeral: true
        });

        return;
      }
    }

  } catch (error) {

    console.error("❌ Interaction Error:", error);

    if (!interaction.replied && !interaction.deferred) {

      await interaction.reply({
        content: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่",
        ephemeral: true
      });

    }
  }
});

// =====================================================
// LOGIN
// =====================================================

client.login(process.env.TOKEN);