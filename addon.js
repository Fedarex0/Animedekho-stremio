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

builder.defineStreamHandler(async function(args) {
    console.log('Fetching stream for ID:', args.id);
    
    // Returns a secure HTTPS test video
    return {
        streams: [
            {
                name: "AnimeDekho",
                title: "Test Stream (Secure)",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            }
        ]
    };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
