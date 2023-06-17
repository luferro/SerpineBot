[![CodeFactor](https://www.codefactor.io/repository/github/luferro/serpinebot/badge/master)](https://www.codefactor.io/repository/github/luferro/serpinebot/overview/master)

## SerpineBot

SerpineBot is a monorepo that consists in two applications: **bot** and **web**.
-   **Bot**: Multipurpose Discord bot for my private discord server.
-   **Web**: Overview of all available slash commands with embed samples.

## Features:

-   **Slash commands**
    -   **15** slash commands that result in **60+** commands available to use.
    -   An overview can be found [here](https://serpine-bot.vercel.app).
-   **Jobs**
    -   **30** scheduled jobs
        -   Feed text channels with data on news, deals, anime episodes, manga chapters, memes and more!
        -   Generate a weekly Steam and Xbox leaderboard.
        -   Notify you when an item on your Steam wishlist is released, goes on sale or is added to / removed from a gaming subscription.
        -   Notify users about your birthday.
        -   Remind you about any reminders you set.
        -   And much more!

## Tech Stack

Bot application:
-   Node.js: >= 16.9.0
-   Discord.js
-   TypeScript
-   Mongoose

Web application:
-   Node.js
-   Next.js
-   TypeScript
-   Mantine.dev

## Configuration

Each application package uses its own configuration file. 

Please follow the **.env.example** file within each application package to create you own **.env**.
-   [Example](/apps/bot/.env.example) for bot application .env file
-   [Example](/apps/web/.env.example) for web application .env file

## Usage

**NOTE:** Every command in this section should be executed at the root of the project.

This section includes two guides on how to get the applications: [Docker](#docker) and [Node.js](#nodejs).

This project includes a [docker-compose](docker-compose.yaml) configuration file.

If you have Docker Engine 1.13.0+ installed on your machine, you can go ahead and follow the [Docker](#docker) section guide.
Otherwise, you can skip to the [Node.js](#nodejs) section guide.

### Docker

#### Start the application

**NOTE:** Docker configuration is not yet available for the web application.

```
docker compose up bot
```

And that's it!

### Node.js

#### Install pnpm
```
corepack enable 
corepack prepare pnpm@latest --activate
```
If you do not have Node.js v16.7 or newer, you may install pnpm with the following command:
```
npm install -g pnpm
```

#### Install dependencies
```
pnpm install
```

#### Build project
```
pnpm run build
```

#### Start the application
```
pnpm start --filter bot
```
or
```
pnpm start --filter web
```

And that's it!

## Codestyle

The project follows the codestyle defined in the [prettier configuration](.prettierrc).

## Author

**Luís Ferro**

-   [Github](https://github.com/luferro)
-   [LinkedIn](https://www.linkedin.com/in/luis-ferro/)

## License

Copyright © 2023 [Luís Ferro](https://github.com/luferro)

This project is licensed under the [MIT license](LICENSE).
