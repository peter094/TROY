
export function getSectionCommands(section, commands = []) {
  const visible = commands.filter(command => !command.hidden);

  if (Array.isArray(section.commandNames)) {
    const selected = new Set(
      section.commandNames.map(value => String(value).toLowerCase())
    );
    return visible.filter(command =>
      selected.has(String(command.name).toLowerCase())
    );
  }

  const categories = Array.isArray(section.categories) && section.categories.length
    ? section.categories
    : [section.key];

  const excluded = new Set(section.excludeNames || []);

  return visible.filter(command =>
    categories.includes(command.category) && !excluded.has(command.name)
  );
}

export function buildMenu({ commands = [], config = {}, theme = {} } = {}) {
  const menu = theme.menu || {};
  const sections = Array.isArray(theme.sections) ? theme.sections : [];
  const prefix = String(config.prefix || ".");
  const safeName = String(config.name || "TROY🪖")
    .replace(/[\r\n]/g, " ")
    .slice(0, 40);

  const lines = [
    String(menu.top || "╭━━━〔 ") + safeName + String(menu.titleEnd || " 〕━━━━━━━━━━"),
    String(menu.infoLine || "┃  ◈ ") + "𝙑𝙀𝙍𝙎𝙄𝙊𝙉 : " + String(config.version || "1.0.0"),
    String(menu.infoLine || "┃  ◈ ") + "𝙋𝙍𝙀𝙁𝙄𝙓 : " + prefix,
    String(menu.infoLine || "┃  ◈ ") + "𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 : " + commands.filter(command => !command.hidden).length,
    String(menu.blankLine || "┃")
  ];

  if (!commands.length) {
    lines.push(
      String(menu.infoLine || "┃  ◈ ") + "𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝙈𝙊𝘿𝙐𝙇𝙀𝙎 𝘼𝙍𝙀 𝙋𝙍𝙀𝙋𝘼𝙍𝙄𝙉𝙂..."
    );
  } else {
    const assigned = new Set();

    for (const section of sections) {
      const members = getSectionCommands(section, commands)
        .filter(command => !assigned.has(command.name));

      lines.push(
        String(menu.top || "╭━━━〔 ") +
        String(section.title || section.key) +
        String(menu.titleEnd || " 〕━━━━━━━━━━")
      );

      if (!members.length) {
        lines.push(
          String(menu.itemLine || "┃  ├─ ◇ ") + "(𝙉𝙊 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 𝙔𝙀𝙏)"
        );
      } else {
        for (const command of members) {
          assigned.add(command.name);

          lines.push(
            String(menu.itemLine || "┃  ├─ ◇ ") +
            prefix + command.name +
            (command.description ? " ─ " + command.description : "")
          );
        }
      }

      lines.push(String(menu.bottom || "╰━━━━━━━━━━━━━━━━━━━╯"), "");
    }

    const ungrouped = commands.filter(
      command => !command.hidden && !assigned.has(command.name)
    );

    if (ungrouped.length) {
      lines.push("╭━━━〔 ◈ 𝙊𝙏𝙃𝙀𝙍 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 〕━━━━━━━━━━");

      for (const command of ungrouped) {
        lines.push(
          String(menu.itemLine || "┃  ├─ ◇ ") + prefix + command.name
        );
      }

      lines.push(String(menu.bottom || "╰━━━━━━━━━━━━━━━━━━━╯"));
    }
  }

  lines.push("");
  lines.push("⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙏𝙍𝙊𝙔 🪖");

  return lines.join("\n");
}
