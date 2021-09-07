module.exports = {
    name: 'cmd',
    getHelp(message, args){
        message.delete({ timeout: 5000 });

        switch(args[1]) {
            case 'aww':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Aww',
                    fields: [
                        {
                            name: '`./aww`',
                            value: 'Returns a random cute picture.'
                        }
                    ],
                    footer: {
                        text: 'Powered by Reddit.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'comics':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Comics',
                    fields: [
                        {
                            name: '`./comics cyanide and happiness`',
                            value: 'Returns a Cyanide and Happiness comic.'
                        },
                        {
                            name: '`./comics garfield`',
                            value: 'Returns a Garfield comic.'
                        },
                        {
                            name: '`./comics fowl language`',
                            value: 'Returns a Fowl Language comic.'
                        },
                        {
                            name: '`./comics sarahs scribbles`',
                            value: 'Returns a Sarah\'s Scribbles comic.'
                        },
                        {
                            name: '`./comics peanuts`',
                            value: 'Returns a Peanuts comic.'
                        },
                        {
                            name: '`./comics calvin and hobbes`',
                            value: 'Returns a Calvin and Hobbes comic.'
                        },
                        {
                            name: '`./comics get fuzzy`',
                            value: 'Returns a Get Fuzzy comic.'
                        },
                        {
                            name: '`./comics jake likes onions`',
                            value: 'Returns a Jake Likes Onions comic.'
                        }
                    ],
                    footer: {
                        text: 'Powered by explosm.net and gocomics.com.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'deals':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Deals',
                    fields: [
                        {
                            name: '`./deals <Game title>`',
                            value: 'Returns the best deals (official stores and keyshops) for a given game.'
                        }
                    ],
                    footer: {
                        text: 'Powered by gg.deals.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'del':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Delete',
                    fields: [
                        {
                            name: '`./del <Quantity of messages>`',
                            value: 'Allows you to delete messages in bulk. Maximum quantity of 100 messages in one go.'
                        },
                        {
                            name: '`./delBot <Bot message ID>`',
                            value: 'Allows you to delete BOT messages by ID.'
                        }
                    ]
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'games':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Games',
                    fields: [
                        {
                            name: '`./games <Game title>`',
                            value: 'Returns a general overview of a given game.'
                        }
                    ],
                    footer: {
                        text: 'Powered by Rawg and HowLongToBeat.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'hltb':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'How Long To Beat',
                    fields: [
                        {
                            name: '`./hltb <Game title>`',
                            value: 'Returns an average playtime needed to beat a given game.'
                        }
                    ],
                    footer: {
                        text: 'Powered by HowLongToBeat.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'jokes':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Jokes',
                    fields: [
                        {
                            name: '`./jokes prog`',
                            value: 'Returns a programming joke.'
                        },
                        {
                            name: '`./jokes misc`',
                            value: 'Returns a miscellaneous joke.'
                        },
                        {
                            name: '`./jokes dark`',
                            value: 'Returns a dark joke.'
                        },
                        {
                            name: '`./jokes dad`',
                            value: 'Returns a dad joke.'
                        },
                        {
                            name: '`./jokes yo momma`',
                            value: 'Returns a yo momma joke.'
                        }
                    ],
                    footer: {
                        text: 'Powered by JokeAPI and icanhazdadjokeAPI.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'memes':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Memes',
                    fields: [
                        {
                            name: '`./memes`',
                            value: 'Returns a random meme.'
                        }
                    ],
                    footer: {
                        text: 'Powered by Reddit.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'movies':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Movies',
                    fields: [
                        {
                            name: '`./movies <Movie title>`',
                            value: 'Returns an overview of a given movie.'
                        }
                    ],
                    footer: {
                        text: 'Powered by The Movie DB and JustWatch.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'music':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Music',
                    fields: [
                        {
                            name: '`./join`',
                            value: 'Bot joins the voice channel you\'re in.'
                        },
                        {
                            name: '`./play <Youtube query>`',
                            value: 'Plays the first result matching your search query.'
                        },
                        {
                            name: '`./loop`',
                            value: 'Sets the current item on loop.'
                        },
                        {
                            name: '`./skip`',
                            value: 'Skips the current item.'
                        },
                        {
                            name: '`./queue`',
                            value: 'Shows you the current queue.'
                        },
                        {
                            name: '`./remove <Index to remove>`',
                            value: 'Removes a given item from the queue.'
                        },
                        {
                            name: '`./clear`',
                            value: 'Removes every item in the queue.'
                        },
                        {
                            name: '`./leave`',
                            value: 'Bot leaves the voice channel.'
                        }
                    ],
                    footer: {
                        text: 'Powered by youtubei.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'poll':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Poll',
                    fields: [
                        {
                            name: '`./poll <question> <optional: item 1, item 2, item 3, etc>`',
                            value: 'Creates a poll with reactions.'
                        }
                    ]
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'reminder':	
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Reminder',
                    fields: [
                        {
                            name: '`./reminder <time> <message>`',
                            value: 'Sets a reminder for a given message.'
                        }
                    ]
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'reviews':	
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Reviews',
                    fields: [
                        {
                            name: '`./reviews <Game title>`',
                            value: 'Returns reviews for a given game.'
                        }
                    ],
                    footer: {
                        text: 'Powered by OpenCritic.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'secretsanta':	
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Secret Santa',
                    fields: [
                        {
                            name: '`./secretsanta @user1 @user2 @user3`',
                            value: 'Organizes a secret santa. '
                        }
                    ]
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'specs':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Specs',
                    fields: [
                        {
                            name: '`./specs <Game title>`',
                            value: 'Returns the minimum and recommended system requirements of a given game.'
                        }
                    ],
                    footer: {
                        text: 'Powered by Game-Debate.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'steam':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Steam',
                    fields: [
                        {
                            name: '`./steam sale`',
                            value: 'Returns the next steam sale.'
                        },
                        {
                            name: '`./steam top played`',
                            value: 'Returns Steam\'s top played games.'
                        },
                        {
                            name: '`./steam top sellers`',
                            value: 'Returns Steam\'s top sellers.'
                        },
                        {
                            name: '`./steam upcoming`',
                            value: 'Returns Steam\'s upcoming games.'
                        },
                        {
                            name: '`./steam low <Game title>`',
                            value: 'Returns Steam\'s historical lows for a given game.'
                        },
                        {
                            name: '`./steam import <Wishlist URL>`',
                            value: 'Import your Steam wishlist.'
                        },
                        {
                            name: '`./steam sync`',
                            value: 'Manually synchronize your Steam wishlist.'
                        },
                        {
                            name: '`./steam wishlist`',
                            value: 'Returns your Steam wishlist.'
                        },
                        {
                            name: '`./steam wishlist <Mention>`',
                            value: 'Returns the mentioned user\'s Steam wishlist.'
                        },
                        {
                            name: '`./steam delete`',
                            value: 'Delete Steam wishlist integration.'
                        }
                    ],
                    footer: {
                        text: 'Powered by Steam, prepareyourwallet and IsThereAnyDeal.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'tv':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'TV Shows',
                    fields: [
                        {
                            name: '`./tv <TV Show title>`',
                            value: 'Returns an overview of a given TV show.'
                        }
                    ],
                    footer: {
                        text: 'Powered by The Movie DB and JustWatch.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            case 'youtube':
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Youtube',
                    fields: [
                        {
                            name: '`./youtube <Youtube query>`',
                            value: 'Returns a the Youtube URL that matches your search query.'
                        }
                    ],
                    footer: {
                        text: 'Powered by youtubei.'
                    }
                }}).then(m => { m.delete({ timeout: 10000 }) });
            default:
                return message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Available commands',
                    fields: [
                        {
                            name: '**Prefixes**',
                            value: '`.<command>`\n`/<command>`\n`./<command>`\n`$<command>`'
                        },
                        {
                            name: '**Comics**',
                            value: '`./cmd comics`',
                            inline: true
                        },
                        {
                            name: '**Cuteness overload**',
                            value: '`./cmd aww`',
                            inline: true
                        },
                        {
                            name: '**Deals**',
                            value: '`./cmd deals`',
                            inline: true
                        },
                        {
                            name: '**Delete**',
                            value: '`./cmd del`',
                            inline: true
                        },
                        {
                            name: '**Games**',
                            value: '`./cmd games`',
                            inline: true
                        },
                        {
                            name: '**HowLongToBeat**',
                            value: '`./cmd hltb`',
                            inline: true
                        },
                        {
                            name: '**Jokes**',
                            value: '`./cmd jokes`',
                            inline: true
                        },
                        {
                            name: '**Memes**',
                            value: '`./cmd memes`',
                            inline: true
                        },
                        {
                            name: '**Movies**',
                            value: '`./cmd movies`',
                            inline: true
                        },
                        {
                            name: '**Music**',
                            value: '`./cmd music`',
                            inline: true
                        },
                        {
                            name: '**Poll**',
                            value: '`./cmd poll`',
                            inline: true
                        },
                        {
                            name: '**Reminder**',
                            value: '`./cmd reminder`',
                            inline: true
                        },
                        {
                            name: '**Reviews**',
                            value: '`./cmd reviews`',
                            inline: true
                        },
                        {
                            name: '**Secret Santa**',
                            value: '`./cmd secretsanta`',
                            inline: true
                        },
                        {
                            name: '**Specs**',
                            value: '`./cmd specs`',
                            inline: true
                        },
                        {
                            name: '**Steam**',
                            value: '`./cmd steam`',
                            inline: true
                        },
                        {
                            name: '**TV Shows**',
                            value: '`./cmd tv`',
                            inline: true
                        },
                        {
                            name: '**Youtube search**',
                            value: '`./cmd youtube`',
                            inline: true
                        }
                    ]
                }});
        }  
    }
}