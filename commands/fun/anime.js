const Discord = require('discord.js');
const fetch = require('node-fetch');

const utils = require(__basedir + '/utils/utils');

let query = `
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

let anime = function(message, args) {

    let title = args.join(' ');

    let variables = {
        search: title
    }

    let url = 'https://graphql.anilist.co',
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
        data = data.data.Media;

        let nextEpisode = data.nextAiringEpisode;

        let embedData = {
            title: data.title.romaji,
            url: 'https://anilist.co/anime/' + data.id + '/',
            description: (data.description ? data.description.replace("<br>", '\n').replace(/<br>|<\/br>/g, '')
                .replace(/<i>|<\/i>/g, '*').replace(/<b>|<\/b>/g, '**') : 'N/A'),
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
        let embed = new Discord.RichEmbed(embedData);

        message.channel.send('', embed);
    }
    
    function handleError(error) {
        error = (error.errors ? error.errors[0] : error);
        if (error.status != 404) {
            console.log(error);
        }
    }
}

module.exports = anime;