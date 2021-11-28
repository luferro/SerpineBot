import youtubeService from 'youtubei';

const youtube = new youtubeService.Client();

const getYoutubeURL = async interaction => {
    const query = interaction.options.getString('query');
    const results = await youtube.search(query);

    interaction.reply({ content: `https://www.youtube.com/watch?v=${results[0].id}` });
}

export default { getYoutubeURL };