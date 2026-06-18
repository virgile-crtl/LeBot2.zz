# 🎵 LeBot2.zz

![GitHub License](https://img.shields.io/github/license/virgile-crtl/LeBot2.zz)

A **Discord bot** built in **TypeScript** run with **docker** that plays music and manages your server — from temporary voice channel creation to automatic role assignment once members accept the rules.

---

## 🚀 Features

- 🎶 **Music playback per server** — each server has its own playlist.
- ⚙️ **Server management** — temporary voice channels, automatic role assignment after validation, and more.
- 🌍 **Internationalization (i18n)** — multi-language support using i18next.
- 🧩 **Extensible architecture** — easily add commands or extend functionality.

---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Libraries:** `discord.js`, `youtube-dl-exec`, `ffmpeg`, `i18next`
- **Quality Tools:** `ESLint` for code style, `Jest` for testing
- **Runtime:** Node.js, Docker
- **Version Control:** Git / GitHub

---

## ⚙️ Project Architecture

The bot runs as a **persistent server application**.
It must be hosted continuously (e.g., on a VPS or a dedicated server).

---

## 🧩 Requirements

Before running the bot, make sure you have:

- ✅ A registered bot on the **[Discord Developer Portal](https://discord.com/developers/applications)** with:
  - `BOT_TOKEN`
  - `CLIENT_ID`

### For run with Docker
---
- ✅ **Docker Docker-compose**

### For run with Node
---
- ✅ **Node.js** (latest LTS recommended)
- ✅ **FFmpeg** installed and available in your PATH

---

## 🧰 Installation

```bash
# Clone the repository
git clone https://github.com/virgile-crtl/LeBot2.zz.git
cd LeBot2.zz
```

Create your environment file(s):

- `.env.dev` → for development
- `.env.prod` → for production

Example configuration:

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
DATABASE_URL=your_database_url_here
```

For .env.dev add server id:

```env
GUILD_ID=serverid
```

---

## ▶️ Running the Bot

### With Docker

**Development mode:**
```bash
docker compose --profile dev up
```

**Production mode:**
```bash
docker compose --profile produp
```

### With NODE
---
Before run install dependencies:

```bash
npm i
```

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm run start
```

---

## 🧪 Testing & Quality

- **Formatting / Linting:** ESLint
- **Unit testing:** Jest

### With Docker
---

Run tests:

```bash
docker compose --profile test up
```

Run linter
```bash
docker compose --profile lint up
```


Additional options:
```bash
docker compose --profile coverage up
docker compose --profile test:ci up 
```



### With Node
---

Install dependencies:

```bash
npm i
```

Run tests

```bash
npm run test
```

Run linter
```bash
npm run lint
```


Additional options:
```bash
npm run test:coverage   # with coverage report
npm run test:ci         # CI-friendly mode
```

Currently, only **unit tests** are implemented.

---

## 📦 Scripts Summary

### Docker
---
| Command | Description |
|----------|-------------|
| `docker compose --profile prod up` | Run project with docker in prod mode |
| `docker compose --profile dev up` | Run project with docker in dev mode |
| `docker compose --profile test up` | Run project tests with docker |
| `docker compose --profile coverage up` | Run project tests with coverage with docker |
| `docker compose --profile lint up` | Run linter with docker |


### Node
---
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
