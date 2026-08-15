#!/usr/bin/env node
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const builder = new addonBuilder({
    id: 'org.animedekhoaddon',
    version: '1.0.0',
    name: 'AnimeDekho Addon',
    description: 'AnimeDekho Stremio Addon',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt']
});

builder.defineStreamHandler(async function(args) {
    console.log('Fetching stream for ID:', args.id);
    
    // Return an empty array for now until scraping logic is added
    return { streams: [] };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
