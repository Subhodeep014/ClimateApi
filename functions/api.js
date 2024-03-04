const PORT = process.env.PORT || 8000;
const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio  =require("cheerio");
const serverless = require("serverless-http");
const app =  express();

const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ""
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ""
    },
    {
        name: 'telegraph',
        address : 'https://www.telegraph.co.uk/climate-change/',
        base: "https://www.telegraph.co.uk"
    }
]

// const articles = [];
const keywords = ['climate', 'environment', 'gobal warming', 'green', 'clean', 'fossil fuel', 'heat']; // Add your desired keywords here

//  function for getting all articles


router.get('/',(req, res)=>{
    res.json('Welcome to My climate Change News API')
})

router.get('/news', async (req, res) => {
    const articles = [];

    try {
        // Use Promise.all() to wait for all Axios requests to resolve
        await Promise.all(newspapers.map(async (newspaper) => {
            const response = await axios.get(newspaper.address);
            const html = response.data;
            const $ = cheerio.load(html);

            if (newspaper.name === 'guardian') {
                $('a.dcr-lv2v9o').each(function () {
                    const title = $(this).attr('aria-label');
                    const url = $(this).attr('href');
                    const lowercaseTitle = title.toLowerCase();
                    if (keywords.some(keyword => lowercaseTitle.includes(keyword))) {
                        articles.push({
                            title,
                            url,
                            source: newspaper.name
                        });
                    }
                });
            } else if (newspaper.name === 'telegraph') {
                $('.card__content').each((index, element) => {
                    const titleElement = $(element).find('.list-headline__text');
                    const title = titleElement.text().trim();
                    const urlElement = $(element).find('.list-headline__link');
                    const url = urlElement.attr('href');
                    const containsKeyword = keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
                    if (containsKeyword) {
                        articles.push({
                            title,
                            url: newspaper.base + url,
                            source: newspaper.name
                        });
                    }
                });
            } else if (newspaper.name === 'thetimes') {
                $('.css-1b0n9er').each((index, element) => {
                    const title = $(element).find('h3').text().trim();
                    const url = $(element).find('a').attr('href');
                    const containsKeyword = keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
                    if (containsKeyword) {
                        articles.push({
                            title,
                            url,
                            source: newspaper.name
                        });
                    }
                });
            }
        }));
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// function for getting specific artices

router.get('/news/:newspaperId', async (req, res) => {
    const newspaperId = req.params.newspaperId;
    const newspaper = newspapers.find(newspaper => newspaper.name === newspaperId);

    if (!newspaper) {
        return res.status(404).json({ error: "Newspaper not found" });
    }

    try {
        const response = await axios.get(newspaper.address);
        const html = response.data;
        const $ = cheerio.load(html);
        const specificArticles = [];

        if (newspaperId === 'guardian') {
            $('a.dcr-lv2v9o').each(function () {
                const title = $(this).attr('aria-label');
                const url = $(this).attr('href');
                const lowercaseTitle = title.toLowerCase();
                if (keywords.some(keyword => lowercaseTitle.includes(keyword))) {
                    // Check if any of the keywords are present in the title
                    specificArticles.push({
                        title,
                        url,
                        source: newspaperId
                    });
                }
            });
        } else if (newspaperId === 'telegraph') {
            $('.card__content').each((index, element) => {
                const titleElement = $(element).find('.list-headline__text');
                const title = titleElement.text().trim();
                const urlElement = $(element).find('.list-headline__link');
                const url = urlElement.attr('href');
                
                // Check if the title contains any of the keywords
                const containsKeyword = keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
                
                if (containsKeyword) {
                    specificArticles.push({
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name
                    });
                }
            });
        } else if (newspaperId === 'thetimes') {
            $('.css-1b0n9er').each((index, element) => {
                const title = $(element).find('h3').text().trim();
                const url = $(element).find('a').attr('href');
                
                // Check if the title contains any of the keywords
                const containsKeyword = keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
                
                if (containsKeyword) {
                    specificArticles.push({
                        title,
                        url,
                        source: newspaper.name
                    });
                }
            });
        }

        res.json(specificArticles);
    } catch (error) {
        console.log(`Error fetching articles from ${newspaper.name}: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.use('/.netlify/functions/api', router)

module.exports.handler = serverless(app);
// app.listen(PORT, ()=> console.log(`Server running on port ${PORT} `));
    
// module.exports = {scrapeArticles}
// module.exports = {apiFunction}