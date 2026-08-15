#!/usr/bin/env node
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const builder = new addonBuilder({
    id: 'org.animedekhoaddon',
    version: '1.0.0',
    name: 'AnimeDekho Addon',
    description: 'AnimeDekho Stremio Addon',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    catalogs: []
});

const TMDB_API_KEY = '2318ee9d371694d3fc3079a6aa6f6144';
const SITE_URL = 'https://animedekho.app';

builder.defineStreamHandler(async function(args) {
    console.log('Stremio clicked on ID:', args.id);
    
    // Stremio IDs look like "tt1234567" or "tt1234567:1:2" (Series:Season:Episode)
    const imdbId = args.id.split(':')[0]; 

    try {
        // 1. Ask TMDB for the Anime Name
        const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
        const tmdbResponse = await fetch(tmdbUrl);
        const tmdbData = await tmdbResponse.json();
        
        let title = '';
        if (tmdbData.movie_results && tmdbData.movie_results.length > 0) {
            title = tmdbData.movie_results[0].title || tmdbData.movie_results[0].original_title;
        } else if (tmdbData.tv_results && tmdbData.tv_results.length > 0) {
            title = tmdbData.tv_results[0].name || tmdbData.tv_results[0].original_name;
        }

        if (!title) {
            console.log('No title found on TMDB for ID:', imdbId);
            return { streams: [] };
        }

        console.log('TMDB found the title:', title);

        // 2. Connect to animedekho.app
        const searchQuery = encodeURIComponent(title);
        
        // This will create a button that opens the browser to search for that show
        return {
            streams: [
                {
                    name: "AnimeDekho",
                    description: `Search for "${title}"`,
                    externalUrl: `${SITE_URL}/search?keyword=${searchQuery}`
                }
            ]
        };

    } catch (error) {
        console.error('Error getting data:', error);
        return { streams: [] };
    }
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
