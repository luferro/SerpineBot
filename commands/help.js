const fetch = require('node-fetch');

module.exports = {
    name: 'cmd',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        switch(args[1]) {
            case 'del':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./del commands",
                    fields: [
                        {
                            name: "`./del <quantity>`",
                            value: "Allows you to delete messages in bulk. Maximum quantity of 99 messages in one go."
                        }
                    ]
                }});
            break;
            case 'joke':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./joke commands",
                    fields: [
                        {
                            name: "`./joke prog`",
                            value: "Programming jokes."
                        },
                        {
                            name: "`./joke misc`",
                            value: "Miscellaneous jokes."
                        },
                        {
                            name: "`./joke dark`",
                            value: "Dark jokes. Will include reddit dark jokes later on to increase variety."
                        },
                        {
                            name: "`./joke dad`",
                            value: "Dad jokes."
                        },
                        {
                            name: "`./joke yomomma`",
                            value: "Yo momma jokes."
                        }
                    ],
                    footer: {
                        text: "Data acquired using JokeAPI, icanhazdadjokeAPI"
                    }
                }});
            break;
            case 'poll':
                client.commands.get('poll').execute(message, args);
            break;
            case 'flame':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./flame commands",
                    fields: [
                        {
                            name: "`./flame`",
                            value: "Random insult."
                        }
                    ],
                    footer: {
                        text: "Data acquired using evilinsultAPI and scraping fungenerators.com"
                    }
                }});
            break;
            case 'comics':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./comics commands",
                    fields: [
                        {
                            name: "`./comics cyanide`",
                            value: "Cyanide comics."
                        },
                        {
                            name: "`./comics garfield`",
                            value: "Garfield comics."
                        },
                        {
                            name: "`./comics fowl`",
                            value: "Fowl Language comics."
                        },
                        {
                            name: "`./comics sarah`",
                            value: "Sarah's Scribbles comics."
                        },
                        {
                            name: "`./comics peanuts`",
                            value: "Peanuts comics."
                        },
                        {
                            name: "`./comics calvin`",
                            value: "Calvin and Hobbes comics."
                        },
                        {
                            name: "`./comics getfuzzy`",
                            value: "Get Fuzzy comics."
                        },
                        {
                            name: "`./comics jake`",
                            value: "Jake Likes Onions comics."
                        }
                    ],
                    footer: {
                        text: "Data acquired scraping explosm.net and gocomics.com"
                    }
                }});
            break;
            case 'aww':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./aww commands",
                    fields: [
                        {
                            name: "`./aww`",
                            value: "Gives you a random pic of a cute animal."
                        }
                    ],
                    footer: {
                        text: "Data acquired using RedditAPI"
                    }
                }});
            break;
            case 'memes':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./memes commands",
                    fields: [
                        {
                            name: "`./memes`",
                            value: "Gives you a random meme."
                        }
                    ],
                    footer: {
                        text: "Data acquired using RedditAPI"
                    }
                }});
            break;
            case 'deals':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./deals commands",
                    fields: [
                        {
                            name: "`./deals -s <product_title>`",
                            value: "Look up any product you want. Will return 12 products that match your product_title"
                        },
                        {
                            name: "`./deals -d <product_title>`",
                            value: "Will show you details of a certain product.\nBe sure to specify whatever product you are looking for."
                        }
                    ],
                    footer: {
                        text: "Data acquired scraping ZwameComparador"
                    }
                }});
            break;
            case 'books':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./books commands",
                    fields: [
                        {
                            name: "`./books -s <store_name> <product_title>`",
                            value: "Look up any book you want. Will return 10 books that match your product_title.\nStores include Book Depository - bd, Bertrand - bertrand, Fnac - fnac"
                        },
                        {
                            name: "`./books -d <store_name> <product_title>`",
                            value: "Will show you details of a certain book.\nBe sure to specify whatever book you are looking for."
                        },
                        {
                            name: "`./books -c <product_title>`",
                            value: "Will compare prices of a given book.\nBe sure to specify whatever book you are looking for."
                        }
                    ],
                    footer: {
                        text: "Data acquired scraping Book Depository, Bertrand, Fnac."
                    }
                }});
            break;
            case 'reviews':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./reviews commands",
                    fields: [
                        {
                            name: "`./reviews`",
                            value: "Gives you the last 10 reviewed games on r/Games"
                        },
                        {
                            name: "`./reviews -d <game_title>`",
                            value: "Looks up any given game. Will return its OpenCritic score."
                        }
                    ],
                    footer: {
                        text: "Data acquired using RedditAPI"
                    }
                }});
            break;
            case 'releasing':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./releasing commands",
                    fields: [
                        {
                            name: "`./releasing <month: 1-12>`",
                            value: "Gives the top 20 games releasing in a given month. Month argument must be given as a number: 1-12"
                        },
                        {
                            name: "`./releasing -d <game_title>`",
                            value: "Looks up any given upcoming game."
                        }
                    ],
                    footer: {
                        text: "Data acquired using RawgAPI"
                    }
                }});
            break;
            case 'cmpgame':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./cmpgame commands",
                    fields: [
                        {
                            name: "`./cmpgame <game_title>`",
                            value: "Compares prices of a given game."
                        }
                    ],
                    footer: {
                        text: "Data acquired scraping AllKeyShop"
                    }
                }});
            break;
            case 'specs':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./specs commands",
                    fields: [
                        {
                            name: "`./specs <game_title>`",
                            value: "Gives you the Minimum and Recommended System Requirements of a given game."
                        }
                    ],
                    footer: {
                        text: "Data acquired scraping GameDebate"
                    }
                }});
            break;
            case 'serpine':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./serpine commands",
                    fields: [
                        {
                            name: "`./serpine`",
                            value: "Links you to my Github profile!"
                        }
                    ]
                }});
            break;
            case 'github':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./github commands",
                    fields: [
                        {
                            name: "`./github -s <repository_name>`",
                            value: "Look up any repository you want! Will show you the first 10 results."
                        },
                        {
                            name: "`./github -d <repository_name>`",
                            value: "Will show you details of a certain repository.\nBe sure to specify whatever repository you are looking for."
                        }
                    ],
                    footer: {
                        text: "Data acquired using GitHub API"
                    }
                }});
            break;
            case 'anime':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./anime commands",
                    fields: [
                        {
                            name: "`./anime today`",
                            value: "Gives you a random anime airing today."
                        },
                        {
                            name: "`./anime today all`",
                            value: "Sends a private message with all anime airing today."
                        },
                        {
                            name: "`./anime <season>`",
                            value: "Gives you a random anime from any given season. Season argument: spring, summer, fall, winter"
                        },
                        {
                            name: "`./anime <season> all`",
                            value: "Sends a private message with all anime from any given season. Season argument: spring, summer, fall, winter"
                        }
                    ],
                    footer: {
                        text: "Data acquired using JikanAPI."
                    }
                }});
            break;
            case 'music':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./music commands",
                    fields: [
                        {
                            name: "`./join`",
                            value: "Bot joins the voice channel you're in."
                        },
                        {
                            name: "`./play <Youtube query>`",
                            value: "Plays the first result matching your search query."
                        },
                        {
                            name: "`./loop`",
                            value: "Sets the current item on loop."
                        },
                        {
                            name: "`./skip`",
                            value: "Skips the current item."
                        },
                        {
                            name: "`./queue`",
                            value: "Shows you the current queue."
                        },
                        {
                            name: "`./remove <index>`",
                            value: "Removes a given item from the queue."
                        },
                        {
                            name: "`./clear`",
                            value: "Removes every item on the queue."
                        },
                        {
                            name: "`./leave`",
                            value: "Bot leaves the voice channel."
                        }
                    ],
                    footer: {
                        text: "Data acquired using Youtube API and scrape-YT."
                    }
                }});
            break;
            case 'geturl':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./geturl commands",
                    fields: [
                        {
                            name: "`./geturl <Youtube query>`",
                            value: "Gives you the Youtube URL for a given Youtube search query."
                        }
                    ],
                    footer: {
                        text: "Data acquired using scrape-YT."
                    }
                }});
            break;
            case 'yesorno':	
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./yesorno commands",
                    fields: [
                        {
                            name: "`./yesorno <optional_question>`",
                            value: "Gives either a yes or a no. You can add any question you want to this command."
                        }
                    ],
                    footer: {
                        text: "Data acquired using YesOrNoAPI"
                    }
                }});
            break;
            case 'char':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./char commands",
                    fields: [
                        {
                            name: "`./char`",
                            value: "Gives you a random character from a random universe."
                        }
                    ],
                    footer: {
                        text: "Data acquired using SuperheroAPI."
                    }
                }});
            break;
            case 'pokecard':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./pokecard commands",
                    fields: [
                        {
                            name: "`./pokecard`",
                            value: "Gives you a random pokémon trading card."
                        }
                    ],
                    footer: {
                        text: "Data acquired using pokemontcgAPI."
                    }
                }});
            break;
            case 'news':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./news commands",
                    fields: [
                        {
                            name: "`./news <country_code> <category>`",
                            value: "Gives you news for a given country and category.\nCountry_code is a two digit code such as 'pt'.\bCategories available are s - sports, b - business, h - health, sci - science, t - technology, e - entertainment "
                        }
                    ],
                    footer: {
                        text: "Data acquired using NewsAPI"
                    }
                }});
            break;
            case 'holidays':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./holidays commands",
                    fields: [
                        {
                            name: "`./holidays <month> <year>`",
                            value: "Gives you all holidays in any given month and year. Month argument must be given as a number: 1-12."
                        }
                    ],
                    footer: {
                        text: "Data acquired using CalendarificAPI"
                    }
                }});
            break;
            case 'weather':
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "./weather commands",
                    fields: [
                        {
                            name: "`./weather <city>`",
                            value: "Gives the current weather forecast for any given city."
                        }
                    ],
                    footer: {
                        text: "Data acquired using the OpenWeatherAPI"
                    }
                }});
            break;
            default:
                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: "Available commands",
                    fields: [
                        {
                            name: "**Anime**",
                            value: "`./cmd anime`",
                            inline: true
                        },
                        {
                            name: "**Books**",
                            value: "`./cmd books`",
                            inline: true
                        },
                        {
                            name: "**Characters**",
                            value: "`./cmd char`",
                            inline: true
                        },
                        {
                            name: "**Comics**",
                            value: "`./cmd comics`",
                            inline: true
                        },
                        {
                            name: "**Compare Game**",
                            value: "`./cmd cmpgame`",
                            inline: true
                        },
                        {
                            name: "**Cuteness overload**",
                            value: "`./cmd aww`",
                            inline: true
                        },
                        {
                            name: "**Deals**",
                            value: "`./cmd deals`",
                            inline: true
                        },
                        {
                            name: "**Delete**",
                            value: "`./cmd del`",
                            inline: true
                        },
                        {
                            name: "**Flame**",
                            value: "`./cmd flame`",
                            inline: true
                        },
                        {
                            name: "**Get Youtube URL**",
                            value: "`./cmd geturl`",
                            inline: true
                        },
                        {
                            name: "**Github**",
                            value: "`./cmd github`",
                            inline: true
                        },
                        {
                            name: "**Holidays**",
                            value: "`./cmd holidays`",
                            inline: true
                        },
                        {
                            name: "**Joke**",
                            value: "`./cmd joke`",
                            inline: true
                        },
                        {
                            name: "**Memes**",
                            value: "`./cmd memes`",
                            inline: true
                        },
                        {
                            name: "**Music**",
                            value: "`./cmd music`",
                            inline: true
                        },
                        {
                            name: "**News**",
                            value: "`./cmd news`",
                            inline: true
                        },
                        {
                            name: "**Pokemon TC**",
                            value: "`./cmd pokecard`",
                            inline: true
                        },
                        {
                            name: "**Releasing**",
                            value: "`./cmd releasing`",
                            inline: true
                        },
                        {
                            name: "**Reviews**",
                            value: "`./cmd reviews`",
                            inline: true
                        },
                        {
                            name: "**Serpine**",
                            value: "`./cmd serpine`",
                            inline: true
                        },
                        {
                            name: "**Specs**",
                            value: "`./cmd specs`",
                            inline: true
                        },
                        {
                            name: "**Weather**",
                            value: "`./cmd weather`",
                            inline: true
                        },
                        {
                            name: "**YesOrNo**",
                            value: "`./cmd yesorno`",
                            inline: true
                        }
                    ]
                }});
                break;
        }  
    }
}