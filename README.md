# 🎵 LeBot2.zz

![GitHub License](https://img.shields.io/github/license/virgile-crtl/GameSenseMonitor)

A **Discord bot** built in **TypeScript** that plays music and manages your server — from temporary voice channel creation to automatic role assignment once members accept the rules.

---

## 🚀 Features

- 🎶 **Music playback per server** — each server has its own playlist.
- ⚙️ **Server management** — temporary voice channels, automatic role assignment after validation, and more.
- 🌍 **Internationalization (i18n)** — multi-language support using i18next.
- 🧩 **Extensible architecture** — easily add commands or extend functionality.

---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Libraries:** `discord.js`, `ytdlp`, `ffmpeg`, `i18next`
- **Quality Tools:** `ESLint` for code style, `Jest` for testing
- **Runtime:** Node.js
- **Version Control:** Git / GitHub

---

## ⚙️ Project Architecture

The bot runs as a **persistent server application**.
It must be hosted continuously (e.g., on a VPS or a dedicated server).

---

## 🧩 Requirements

Before running the bot, make sure you have:

- ✅ **Node.js** (latest LTS recommended)
- ✅ **FFmpeg** installed and available in your PATH
- ✅ **yt-dlp** installed globally
- ✅ A registered bot on the **[Discord Developer Portal](https://discord.com/developers/applications)** with:
  - `BOT_TOKEN`
  - `CLIENT_ID`

---

## 🧰 Installation

```bash
# Clone the repository
git clone https://github.com/virgile-crtl/LeBot2.zz.git
cd LeBot2.zz

# Install dependencies
npm install
```

Create your environment file(s):

- `.env.dev` → for development
- `.env.prod` → for production

Example configuration:

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
TRANSLATION_FOLDER=/absolute/path/to/locales
PLAYLISTS_FOLDER=/absolute/path/to/playlists
CMDS_FOLDER=/absolute/path/to/commands
LANGUAGE=en
```

> **Note:**
> Paths (`*_FOLDER`) must be **absolute** paths to the respective directories.

---

## ▶️ Running the Bot

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run start
```

---

## 🧪 Testing & Quality

- **Formatting / Linting:** ESLint
- **Unit testing:** Jest

Run tests with:

```bash
npm run test
```

Additional options:
```bash
npm run test:coverage   # with coverage report
npm run test:ci         # CI-friendly mode
```

Currently, only **unit tests** are implemented.

---

## 📦 Scripts Summary

| Command | Description |
|----------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start the bot in production |
| `npm run dev` | Run the bot in development with `ts-node` |
| `npm run lint` | Run ESLint on all source files |
| `npm run test` | Execute Jest tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:ci` | Run tests in CI mode |

---

## 👤 Author

**LaMenace2.zzn**
Creator and sole maintainer of LeBot2.zz.

💡 Contributions are welcome!
If you want to improve the bot, feel free to open a **Pull Request**.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🔗 Repository

[https://github.com/virgile-crtl/LeBot2.zz.git](https://github.com/virgile-crtl/LeBot2.zz.git)
