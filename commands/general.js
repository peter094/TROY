
import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];
  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");
  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function" ? raw.toNumber() : Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers) ? config.ownerNumbers : [];
  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Display the TROY premium menu and available command sections.",
    run: async ctx => {
      const menu = buildMenu({ commands: ctx.commands, config: ctx.config, theme: ctx.theme });

      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption:
              "✦ *𝙏𝙍𝙊𝙔 🪖 — 𝙒𝙃𝘼𝙏𝙎𝘼𝙋𝙋 𝘽𝙊𝙏*\n" +
              "◈ Official pairing portal: " + ctx.config.botUrl + "\n" +
              "⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙍𝙊𝙔 🪖"
          });
        } catch (error) {
          console.warn("TROY menu artwork could not be sent; using the text menu:", error?.message || error);
        }
      }

      await ctx.reply(menu);
    }
  },

  {
    name: "help",
    category: "General",
    description: "Display registered commands and their descriptions.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command =>
          ctx.config.prefix + command.name +
          (command.description ? " ─ " + command.description : "")
        );

      const header =
        "╭━━━〔 ✧ 𝙏𝙍𝙊𝙔 🪖 𝙃𝙀𝙇𝙋 〕━━━━━━━━━━\n" +
        "┃  ◈ 𝙍𝙀𝙂𝙄𝙎𝙏𝙀𝙍𝙀𝘿 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎: " + rows.length + "\n" +
        "┃\n";

      const chunks = [];
      let current = header;

      for (const row of rows) {
        if (current.length + row.length + 1 > 3300) {
          chunks.push(current.trimEnd());
          current = "╭━━━〔 ✧ 𝙏𝙍𝙊𝙔 🪖 𝙃𝙀𝙇𝙋 · 𝘾𝙊𝙉𝙏𝙄𝙉𝙐𝙀𝘿 〕━━━━━━━━━━\n\n";
        }
        current += "┃  ├─ ◇ " + row + "\n";
      }

      if (current.trim()) {
        current += "╰━━━━━━━━━━━━━━━━━━━╯";
        chunks.push(current.trimEnd());
      }

      for (const chunk of chunks) await ctx.reply(chunk);
    }
  },

  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null ? null : Math.max(0, Date.now() - timestamp);

      await ctx.reply([
        "╭━━━〔 ◈ 𝙏𝙍𝙊𝙔 🪖 · 𝙋𝙊𝙉𝙂 〕━━━━━━━━━━",
        "┃  ◈ 𝙎𝙏𝘼𝙏𝙐𝙎 : " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        "┃  ◈ 𝙍𝙀𝙎𝙋𝙊𝙉𝙎𝙀 : " + (responseMs === null ? "Unavailable" : responseMs + " ms"),
        "┃  ◈ 𝙐𝙋𝙏𝙄𝙈𝙀 : " + formatDuration(process.uptime()),
        "┃  ◈ 𝙑𝙀𝙍𝙎𝙄𝙊𝙉 : " + ctx.config.version,
        "╰━━━━━━━━━━━━━━━━━━━╯"
      ].join("\n"));
    }
  },

  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Display bot status, mode and uptime.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 ✦ 𝙏𝙍𝙊𝙔 🪖 𝙎𝙏𝘼𝙏𝙐𝙎 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝙎𝙏𝘼𝙏𝙐𝙎 : " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡") +
        "\n┃  ◈ 𝙈𝙊𝘿𝙀 : " + String(ctx.mode || "public").toUpperCase() +
        "\n┃  ◈ 𝙐𝙋𝙏𝙄𝙈𝙀 : " + formatDuration(process.uptime()) +
        "\n┃  ◈ 𝙊𝙒𝙉𝙀𝙍 : " + ctx.config.ownerName +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  },

  {
    name: "owner",
    category: "General",
    description: "Display TROY bot owner information.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);

      await ctx.reply(
        "╭━━━〔 ♛ 𝙊𝙒𝙉𝙀𝙍 𝙄𝙉𝙁𝙊 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝙉𝘼𝙈𝙀 : " + ctx.config.ownerName +
        (number ? "\n┃  ◈ 𝙉𝙐𝙈𝘽𝙀𝙍 : +" + number : "") +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  },

  {
    name: "support",
    category: "General",
    description: "Display support information for TROY.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 ◈ 𝙏𝙍𝙊𝙔 𝙎𝙐𝙋𝙋𝙊𝙍𝙏 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝙃𝙀𝙇𝙋 : For setup assistance or bug reports, contact " +
        ctx.config.ownerName +
        "\n┃  ◈ 𝙂𝙄𝙏𝙃𝙐𝘽 : https://github.com/Benfeitech/FEI-XMD" +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  },

  {
    name: "time",
    category: "General",
    description: "Display the current server time in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());

      await ctx.reply(
        "╭━━━〔 ◷ 𝙉𝙄𝙂𝙀𝙍𝙄𝘼 𝙏𝙄𝙈𝙀 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝙏𝙄𝙈𝙀 : " + value +
        "\n┃  ◈ 𝙏𝙄𝙈𝙀𝙕𝙊𝙉𝙀 : WAT (UTC+1)" +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  },

  {
    name: "date",
    category: "General",
    description: "Display the current date in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());

      await ctx.reply(
        "╭━━━〔 ◈ 𝘿𝘼𝙏𝙀 𝙄𝙉 𝙉𝙄𝙂𝙀𝙍𝙄𝘼 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝘿𝘼𝙏𝙀 : " + value +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  },

  {
    name: "version",
    category: "General",
    description: "Display TROY version and connection information.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 ✧ 𝙏𝙍𝙊𝙔 𝙎𝙔𝙎𝙏𝙀𝙈 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝘽𝙊𝙏 : " + ctx.config.name +
        "\n┃  ◈ 𝙑𝙀𝙍𝙎𝙄𝙊𝙉 : " + ctx.config.version +
        "\n┃  ◈ 𝙎𝙏𝘼𝙏𝙐𝙎 : " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡") +
        "\n┃  ◈ 𝙈𝙊𝘿𝙀 : " + String(ctx.mode || "public").toUpperCase() +
        "\n┃  ◈ 𝙇𝙄𝘽𝙍𝘼𝙍𝙔 : Official WhiskeySockets Baileys" +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  },

  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Display the current chat and message sender IDs.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 ◈ 𝘾𝙃𝘼𝙏 𝙄𝘿 𝙄𝙉𝙁𝙊 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝘾𝙃𝘼𝙏 𝙄𝘿 : " + ctx.jid +
        "\n┃  ◈ 𝙎𝙀𝙉𝘿𝙀𝙍 𝙄𝘿 : " + (ctx.senderJid || "Unavailable") +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  },

  {
    name: "whoami",
    category: "General",
    description: "Display your WhatsApp sender information.",
    run: async ctx => {
      await ctx.reply(
        "╭━━━〔 ◈ 𝙐𝙎𝙀𝙍 𝙋𝙍𝙊𝙁𝙄𝙇𝙀 〕━━━━━━━━━━" +
        "\n┃  ◈ 𝙉𝘼𝙈𝙀 : " + (ctx.msg?.pushName || "Unknown") +
        "\n┃  ◈ 𝙔𝙊𝙐𝙍 𝙄𝘿 : " + (ctx.senderJid || "Unavailable") +
        "\n┃  ◈ 𝙊𝙒𝙉𝙀𝙍 : " + (ctx.owner ? "Yes ♛" : "No") +
        "\n╰━━━━━━━━━━━━━━━━━━━╯"
      );
    }
  }
];

export default commands;
