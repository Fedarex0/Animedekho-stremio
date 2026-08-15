#!/usr/bin/env node
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const builder = new addonBuilder({
    id: 'org.animedekhoaddon',
    version: '1.0.0',
    name: 'AnimeDekho Addon',
    description: 'Direct Anime Streaming Addon for Stremio',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    catalogs: []
});

const TMDB_API_KEY = '2318ee9d371694d3fc3079a6aa6f6144';

builder.defineStreamHandler(async function(args) {
    console.log('Stremio requested ID:', args.id);
    
    const parts = args.id.split(':');
    const imdbId = parts[0];
    const episode = parts[2] || 1;

    try {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
        const tmdbData = await tmdbRes.json();
        
        let title = '';
        if (tmdbData.movie_results && tmdbData.movie_results.length > 0) {
            title = tmdbData.movie_results[0].title || tmdbData.movie_results[0].original_title;
        } else if (tmdbData.tv_results && tmdbData.tv_results.length > 0) {
            title = tmdbData.tv_results[0].name || tmdbData.tv_results[0].original_name;
        }

        if (!title) {
            return { streams: [] };
        }

        console.log(`Resolved TMDB title: ${title}`);

        const searchRes = await fetch(`https://api.consumet.org/anime/gogoanime/${encodeURIComponent(title)}`);
        const searchData = await searchRes.json();

        if (!searchData.results || searchData.results.length === 0) {
            return { streams: [] };
        }

        const animeId = searchData.results[0].id;

        const detailRes = await fetch(`https://api.consumet.org/anime/gogoanime/info/${animeId}`);
        const detailData = await detailRes.json();

        if (!detailData.episodes || detailData.episodes.length === 0) {
            return { streams: [] };
        }

        const targetEp = detailData.episodes.find(ep => ep.number == episode) || detailData.episodes[0];

        const watchRes = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${targetEp.id}`);
        const watchData = await watchRes.json();

        if (!watchData.sources || watchData.sources.length === 0) {
            return { streams: [] };
        }

        const streams = watchData.sources.map(source => ({
            name: "AnimeDekho",
            title: `${title} - Ep ${targetEp.number} (${source.quality || 'HD'})`,
            url: source.url
        }));

        return { streams };

    } catch (err) {
        console.error('Error fetching direct streams:', err);
        return { streams: [] };
    }
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
