const cheerio = require('cheerio');
const got = require('got');

module.exports = {
    name: 'books',
    async execute(message, args){   
        message.delete({ timeout: 5000 });

        let argsbooks = args.slice(2).join(' ');

        if(!args[2]) return message.channel.send('Usage: ./books <-s or -d> <book_title>').then(m => { m.delete({ timeout: 5000 }) });

        switch(args[1]) {
            case '-s':
                got(`https://www.bookdepository.com/search?searchTerm=${argsbooks}&search=Find+book/`)
                    .then(response => {
                        const $ = cheerio.load(response.body);

                        let books = [];
                        $('.content-block div.book-item').each((i, element) => {
                            books.push({
                                title: $(element).find('.item-info .title a').text().trim(),
                                author: $(element).find('.item-info .author span a span').text().trim(),
                                published: $(element).find('.item-info .published').text().trim(),
                                price: $(element).find('.item-info .price-wrap .price').text().trim().split('\n')[0],
                                url: $(element).find('.item-info .title a').attr('href')
                            })
                        });	

                        books.length = 5;
                        
                        message.channel.send({embed: {
                            color: Math.floor(Math.random() * 16777214) + 1,
                            title: `Search results for ${argsbooks}`,
                            description: books.map(book => `
                                **${book.title}**${book.published ? `, ${book.published}` : ''}
                                ${book.author ? `By *${book.author}*` : ''}
                                **Price:** ${book.price ? book.price : 'Not available'}
                                Check it out **[here](https://www.bookdepository.com${book.url})**!
                            `).join(' ')
                        }})
                    })
                    .catch(error => {
                        console.log(error);
                    });		
                break;
            case '-d':                
                got(`https://www.bookdepository.com/search?searchTerm=${argsbooks}&search=Find+book/`)
                    .then(response => {
                        var $ = cheerio.load(response.body);

                        let url = $('.content-block div.book-item .item-info .title a').attr('href');
                        if(!url) return message.channel.send("Couldn't find that book.").then(m => { m.delete({ timeout: 5000 }) });

                        got(`https://www.bookdepository.com${url}`)
                            .then(response => {
                                var $ = cheerio.load(response.body);

                                const title = $('.item-wrap .item-block .item-info h1').text().trim();
                                const thumbnail = $('.item-wrap .item-block .item-img img').attr('src');
                                const author = $('.item-wrap .item-block .item-info .author-info span a span').text().trim();
                                const price = $('.item-wrap .item-block .item-tools .item-info-wrap .sale-price').text().trim();
                                const availability = $('.item-wrap .item-block .item-tools .item-info-wrap p.red-text').length;
                                const format = $('.item-wrap .biblio-wrap .biblio-info li').eq(0).find('span').text().trim().split('|');
                                const cover = format && format[0].replace(/\n/g, '');
                                const pages = format && format[1].split('\n')[0];
                                const published = $('.item-wrap .biblio-wrap .biblio-info li').eq(2).find('span').text().trim();
                                const rating = $('.rating-distribution-wrap #rating-distribution div').eq(1).text().trim();
                                const ratingCount = $('.rating-distribution-wrap #rating-distribution .rating-count').text().trim();

                                message.channel.send({embed: {
                                    color: Math.floor(Math.random() * 16777214) + 1,
                                    author: {
                                        name: `Details found for ${argsbooks}`
                                    },
                                    title: title,
                                    url: `https://www.bookdepository.com${url}`,
                                    description: `
                                        ${author ? `By *${author}*` : ''}
                                        
                                        ${rating && ratingCount ? `***${rating} - ${ratingCount}***` : '***Ratings unavailable.***'}

                                        **Published**: ${published ? published : 'N/A'}
                                        **Cover**: ${cover ? cover : 'N/A'}
                                        **Pages**: ${pages ? pages : 'N/A'}
                                        
                                        **Price**: ${price ? price : 'N/A'}
                                        ${availability == 0 ? `*Available.*` : '*Not available.*'}
                                    `,
                                    thumbnail: {
                                        url: thumbnail ? thumbnail : ''
                                    }
                                }})
                            })
                            .catch(error => {
                                console.log(error);
                            });	
                    })
                    .catch(error => {
                        console.log(error);
                    });		
                break;
            default:
                message.channel.send('Usage: ./books <-s or -d> <book_title>').then(m => { m.delete({ timeout: 5000 }) });
                break;
        }
    }
}