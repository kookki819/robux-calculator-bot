require("dotenv").config();

const {
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("setup-calculator")
    .setDescription("สร้างแผงเครื่องคำนวณ Robux")
    .toJSON()
];

const rest = new REST({ version: "10" })
  .setToken(process.env.TOKEN);

(async () => {
  try {

    console.log("กำลังลงทะเบียนคำสั่ง...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log("✅ ลงทะเบียน /setup-calculator เรียบร้อย");

  } catch (error) {
    console.error("❌ ลงทะเบียนไม่สำเร็จ:", error);
  }
})();