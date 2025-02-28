import fs from 'fs/promises';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import buildWebManifest from './webmanifest.js';
import moveAssets from './move-assets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ejs2html({ path: inputPath, outPath, data = {}, options = {} }) {
    try {
        // Set default data if none provided
        const defaultData = {
            title: 'Hello World',
            ...data
        };
        
        // const template = await fs.readFile(inputPath, 'utf8');
        const html = await ejs.renderFile(inputPath, defaultData, options);
        
        // Create directory if it doesn't exist
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, html);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getAllEjsFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
            return getAllEjsFiles(res);
        }
        return entry.name.endsWith('.ejs') ? res : null;
    }));
    
    return files.flat().filter(file => file !== null);
}

// Add a sleep helper function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processAllEjsFiles() {
    try {
        // Fix: Move up from build directory to find views
        const viewDir = path.join(__dirname, '..', '..', 'views');
        const ejsFiles = await getAllEjsFiles(viewDir);
        
        for (const filepath of ejsFiles) {
            const relativePath = path.relative(viewDir, filepath);
            const outPath = path.join(
                __dirname, 
                path.join('..', '..', '..' , 'build'), // back to folder build
                relativePath.replace('.ejs', '.html')
            );
            
            const filename = path.basename(filepath);
            
            // Prepare template-specific data
            const templateData = {
                title: filename.replace('.ejs', '').toUpperCase(),
                // Default values for all templates
                url: '/404',
                message: 'Internal Server Error',
                stack: '',
                hello: 'Welcome to my website!'
            };

            // Add template-specific data based on file name
            switch (filename) {
                case '404.ejs':
                    templateData.url = '/not-found-page';
                    break;
                case '500.ejs':
                    templateData.message = 'Something went wrong on the server';
                    templateData.stack = 'Error stack trace would appear here in development mode';
                    break;
                case 'index.ejs':
                    templateData.hello = 'Hello, World!';
                    break;
            }

            await ejs2html({
                path: filepath,
                outPath: outPath,
                data: templateData
            });

            console.log(`✓ \x1b[30mProcessed: \x1b[33m ${relativePath} \x1b[30m → \x1b[32m build\\${relativePath.replace('.ejs', '.html')}\x1b[0m`);

            await sleep(20);
        }
    } catch (err) {
        console.error('Error processing EJS files:', err);
    }
}

console.log('🦄 Processing EJS files...');


// Move assets first
moveAssets()

// Build web manifest
await buildWebManifest()

// Process EJS files
await processAllEjsFiles();

console.log("\n✨ All EJS files have been processed! ✨\n");