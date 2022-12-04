[![CodeFactor](https://www.codefactor.io/repository/github/luferro/serpinebot/badge/master)](https://www.codefactor.io/repository/github/luferro/serpinebot/overview/master)

## SerpineBot

SerpineBot is a monorepo that consists in two applications: **bot** and **web**.
-   **Bot**: A multipurpose Discord bot for my private discord server.
-   **Web**: A website to provide an easy way to see all available slash commands with response samples.

## Features:

-   **Slash commands**: An overview of all available slash commands can be found [here](https://serpine-bot.vercel.app).
-   **Webhooks**: Feed text channels with data on various topics (e.g. news, game deals, game reviews, anime episodes and many others).
-   **Jobs**: Scheduled jobs are executed to handle bot integrations (e.g. Steam and Xbox integration), reminders, birthdays and much more.

## Technologies

-   Node.js: >= 16.9.0
-   Discord.js
-   Typescript
-   Mongoose
-   Next.js
-   Mantine.dev

## Install dependencies

```
pnpm install
```

## Build

### Build bot application

```
pnpm build --filter bot
```

### Build web application

```
pnpm build --filter web
```

## Start

### Start bot application

```
pnpm start --filter bot
```

### Start web application

```
pnpm start --filter web
```

## Author

**Luís Ferro**

-   [Github](https://github.com/luferro)
-   [LinkedIn](https://www.linkedin.com/in/luis-ferro/)

## License

Copyright © 2022 [Luís Ferro](https://github.com/luferro)

This project is licensed under the [MIT license](LICENSE).
