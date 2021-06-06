module.exports = {
    name: 'cmd',
    getHelp(message, args){
        message.delete({ timeout: 5000 });

        switch(args[1]) {
            case 'aww':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './aww commands',
                    fields: [
                        {
                            name: '`./aww`',
                            value: 'Gives you a random pic of a cute animal.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired using RedditAPI'
                    }
                }});
                break;
            case 'comics':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './comics commands',
                    fields: [
                        {
                            name: '`./comics cyanide`',
                            value: 'Cyanide comics.'
                        },
                        {
                            name: '`./comics garfield`',
                            value: 'Garfield comics.'
                        },
                        {
                            name: '`./comics fowl`',
                            value: 'Fowl Language comics.'
                        },
                        {
                            name: '`./comics sarah`',
                            value: 'Sarah\'s Scribbles comics.'
                        },
                        {
                            name: '`./comics peanuts`',
                            value: 'Peanuts comics.'
                        },
                        {
                            name: '`./comics calvin`',
                            value: 'Calvin and Hobbes comics.'
                        },
                        {
                            name: '`./comics getfuzzy`',
                            value: 'Get Fuzzy comics.'
                        },
                        {
                            name: '`./comics jake`',
                            value: 'Jake Likes Onions comics.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired scraping explosm.net and gocomics.com'
                    }
                }});
                break;
            case 'del':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './del commands',
                    fields: [
                        {
                            name: '`./del <quantity>`',
                            value: 'Allows you to delete messages in bulk. Maximum quantity of 99 messages in one go.'
                        }
                    ]
                }});
                break;
            case 'geturl':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './geturl commands',
                    fields: [
                        {
                            name: '`./geturl <Youtube query>`',
                            value: 'Gives you the Youtube URL for a given Youtube search query.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired using scrape-YT.'
                    }
                }});
                break;
            case 'github':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './github commands',
                    fields: [
                        {
                            name: '`./github -s <repository_name>`',
                            value: 'Look up any repository you want! Will show you the first 10 results.'
                        },
                        {
                            name: '`./github -d <repository_name>`',
                            value: 'Will show you details of a certain repository.\nBe sure to specify whatever repository you are looking for.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired using GitHub API'
                    }
                }});
                break;
            case 'joke':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './joke commands',
                    fields: [
                        {
                            name: '`./joke prog`',
                            value: 'Programming jokes.'
                        },
                        {
                            name: '`./joke misc`',
                            value: 'Miscellaneous jokes.'
                        },
                        {
                            name: '`./joke dark`',
                            value: 'Dark jokes. Will include reddit dark jokes later on to increase variety.'
                        },
                        {
                            name: '`./joke dad`',
                            value: 'Dad jokes.'
                        },
                        {
                            name: '`./joke yomomma`',
                            value: 'Yo momma jokes.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired using JokeAPI, icanhazdadjokeAPI'
                    }
                }});
                break;
            case 'memes':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './memes commands',
                    fields: [
                        {
                            name: '`./memes`',
                            value: 'Gives you a random meme.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired using RedditAPI'
                    }
                }});
                break;
            case 'music':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './music commands',
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
                            name: '`./remove <index>`',
                            value: 'Removes a given item from the queue.'
                        },
                        {
                            name: '`./clear`',
                            value: 'Removes every item on the queue.'
                        },
                        {
                            name: '`./leave`',
                            value: 'Bot leaves the voice channel.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired using Youtube API and scrape-YT.'
                    }
                }});
                break;
            case 'poll':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './poll commands',
                    fields: [
                        {
                            name: '`./poll`',
                            value: 'Basic poll'
                        }
                    ]
                }});
                break;
            case 'remindme':	
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './remindme commands',
                    fields: [
                        {
                            name: '`./remindme <time> <message> <optional: -save>`',
                            value: 'Reminds you of something after a given time.'
                        }
                    ]
                }});
                break;
            case 'secretsanta':	
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './secretsanta commands',
                    fields: [
                        {
                            name: '`./secretsanta <user1> <user2> <user3>`',
                            value: 'Organizes a secret santa.'
                        }
                    ]
                }});
                break;
            case 'serpine':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './serpine commands',
                    fields: [
                        {
                            name: '`./serpine`',
                            value: 'Links you to my Github profile!'
                        }
                    ]
                }});
                break;
            case 'specs':
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: './specs commands',
                    fields: [
                        {
                            name: '`./specs <game_title>`',
                            value: 'Gives you the Minimum and Recommended System Requirements of a given game.'
                        }
                    ],
                    footer: {
                        text: 'Data acquired scraping GameDebate'
                    }
                }});
                break;
            default:
                message.channel.send({ embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: 'Available commands',
                    fields: [
                        {
                            name: '**Prefixes**',
                            value: '`.<command>`\n`/<command>`\n`./<command>`\n`\\<command>`'
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
                            name: '**Delete**',
                            value: '`./cmd del`',
                            inline: true
                        },
                        {
                            name: '**Get Youtube URL**',
                            value: '`./cmd geturl`',
                            inline: true
                        },
                        {
                            name: '**Github**',
                            value: '`./cmd github`',
                            inline: true
                        },
                        {
                            name: '**Joke**',
                            value: '`./cmd joke`',
                            inline: true
                        },
                        {
                            name: '**Memes**',
                            value: '`./cmd memes`',
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
                            name: '**RemindMe**',
                            value: '`./cmd remindme`',
                            inline: true
                        },
                        {
                            name: '**Secret Santa**',
                            value: '`./cmd secretsanta`',
                            inline: true
                        },
                        {
                            name: '**Serpine**',
                            value: '`./cmd serpine`',
                            inline: true
                        },
                        {
                            name: '**Specs**',
                            value: '`./cmd specs`',
                            inline: true
                        }
                    ]
                }});
                break;
        }  
    }
}