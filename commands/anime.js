const Discord = require('discord.js');
const fetch = require('node-fetch');

const utils = require(__basedir + '/utils/utils');

var query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
        }
        averageScore
        genres
        season
        startDate {
          year
          month
        }
        episodes
        nextAiringEpisode {
            timeUntilAiring
        }
      }
    }
`;

var anime = function(message, args) {

    var title = args.join(' ');

    var variables = {
        search: title
    }

    var url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

    fetch(url, options)
        .then(handleResponse)
        .then(handleData)
        .catch(handleError);

    function handleResponse(response) {
        return response.json()
            .then((json) => {
                return response.ok ? json : Promise.reject(json).then(message.channel.send("I can't find that anime!"));
            });
    }
    
    function handleData(data) {
        var data = data.data.Media;

        var nextEpisode = data.nextAiringEpisode;

        var embedData = {
            title: data.title.romaji,
            url: 'https://anilist.co/anime/' + data.id + '/',
            description: data.description.replace("<br>", '\n').replace(/<br>|<\/br>/g, '')
                .replace(/<i>|<\/i>/g, '*').replace(/<b>|<\/b>/g, '**'),
            thumbnail: {
                url: data.coverImage.large
            },
            fields: [
                {
                    name: '**Score**',
                    value: data.averageScore + '\n' + '-------------------------'
                },
                {
                    name: '**Genres**',
                    value: data.genres.toString().replace(/,/g, ', ') + '\n' + '-------------------------'
                },
                {
                    name: '**Release Date**',
                    value: utils.getMonthName(data.startDate.month) + ' ' + data.startDate.year + '\n' + '-------------------------'
                },
                {
                    name: '**Episodes**',
                    value: data.episodes + '\n' + '-------------------------'
                },
                {
                    name: '**Time Until Next Episode**',
                    value: (nextEpisode ? utils.secondsConverter(nextEpisode.timeUntilAiring) : 'N/A')
                }
            ]
        }
        var embed = new Discord.RichEmbed(embedData);

        message.channel.send('', embed);
    }
    
    function handleError(error) {
        var data = error.errors[0];
        if (data) {
            if (data.status != 404) {
                console.log(error);
            }
        }
    }
}

module.exports = anime;