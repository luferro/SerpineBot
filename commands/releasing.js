const fetch = require('node-fetch');

module.exports = {
    name: 'releasing',
    async execute(message, args){
        message.delete({ timeout: 5000 });

        var d = new Date();
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();

        if(!args[1]) return message.channel.send("Usage: ./releasing <month: 1-12 or -s>").then(m => {m.delete({ timeout: 5000 })});

        let argsreleasing = args.slice(2).join(" ");

        var new_day, new_month;
        if(day < 10) 
            new_day = '0' + day;
        else 
            new_day = '' + day;
        if(month < 10) 
            new_month = '0' + month;
        else 
            new_month = '' + month;
        
        if(args[1] == '-s') {
            if(!argsreleasing) return message.channel.send("Usage: ./releasing <-s> <game title>").then(m => {m.delete({ timeout: 5000 })});
            
            fetch('https://api.rawg.io/api/games?dates='+year+'-'+new_month+'-'+new_day+','+(year+1)+'-'+new_month+'-'+new_day+'&search='+argsreleasing,
            {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "SerpineBot - Personal use bot for my private discord server"
                }
            })
            .then(response => response.json())
            .then(function(data) {
                if((data.results).length > 1 && (data.results[0].name).toLowerCase() != argsreleasing.toLowerCase()) {
                    var search_results = "";
                    for(var i= 0; i < Object.keys(data.results).length; i++) {
                        search_results += data.results[i].name+"\n\n";
                    }

                    return message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "I found the following matches. Try using the full game's name!",
                        description: search_results								
                    }});
                }

                var plataformas = "";
                for(var i= 0; i < Object.keys(data.results[0].platforms).length; i++) {
                    plataformas += data.results[0].platforms[i].platform.name+"; ";
                }

                var tags = "";
                for(var i= 0; i < Object.keys(data.results[0].tags).length; i++) {
                    if(data.results[0].tags[i].language == 'eng')
                        tags += data.results[0].tags[i].name+"; ";
                }

                var genres = "";
                for(var i= 0; i < Object.keys(data.results[0].genres).length; i++) {
                    genres += data.results[0].genres[i].name+"; ";
                }

                message.channel.send({embed: {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    title: data.results[0].name,
                    url: "https://rawg.io/games/"+data.results[0].slug,
                    description: "**Platforms:** "+plataformas+
                        "\n\n**Tags:** "+tags+
                        "\n\n**Genres:** "+genres+
                        "\n\n**Releasing:** "+data.results[0].released,
                    image: {
                        url: data.results[0].background_image
                    }
                }})
                .catch(function(error) {
                    message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                    console.log(error);
                });
            })
            return;
        }

        if(!isNaN(args[1])) {
            var month_selected = args[1], month_selected_doubledigit;
            if(month_selected < 10) 
                month_selected_doubledigit = '0' + month_selected;
            else 
                month_selected_doubledigit = '' + month_selected;

            var firstDay = new Date(year, month_selected, 1).getDate();
            var lastDay = new Date(year, month_selected, 0).getDate();

            var firstDay_doubledigit;
            if(firstDay < 10) 
                firstDay_doubledigit = '0' + firstDay;
            else 
                firstDay_doubledigit = '' + firstDay;

            console.log('https://api.rawg.io/api/games?dates='+year+'-'+month_selected_doubledigit+'-'+firstDay_doubledigit+','+year+'-'+month_selected_doubledigit+'-'+lastDay+'&ordering=-added');
            
            fetch('https://api.rawg.io/api/games?dates='+year+'-'+month_selected_doubledigit+'-'+firstDay_doubledigit+','+year+'-'+month_selected_doubledigit+'-'+lastDay+'&ordering=-added',
                {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "User-Agent": "SerpineBot - Personal use bot for my private discord server"
                    }
                })
                .then(response => response.json())
                .then(function(data) {
                    var month_results = "";
                    for(var i= 0; i < Object.keys(data.results).length; i++) {
                        month_results += data.results[i].name+"\n**Releasing:** "+data.results[i].released+"\n\n";
                    }

                    message.channel.send({embed: {
                        color: Math.floor(Math.random() * 16777214) + 1,
                        title: "These are the top 20 games releasing",
                        description: month_results							
                    }})
                    .catch(function(error) {
                        message.channel.send("Something went wrong!").then(m => {m.delete({ timeout: 5000 })});
                        console.log(error);
                    });
                })
            } else return message.channel.send('Select a valid month: 1-12').then(m => {m.delete({ timeout: 5000 })});						
    }
}