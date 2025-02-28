import fs from 'fs/promises';
import path from 'path';

async function buildWebManifest() {

    const manifest = {
        "name": process.env.NODE_APP_NAME || "LearnEJS",
        "description": process.env.NODE_APP_DESC || "A simple EJS templating engine",
        "short_name": process.env.NODE_APP_SHORT_NAME || "LearnEJS",
        "start_url": "/",
        "icons": [
            {
                "src": "/assets/icons/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/assets/icons/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone"
    };

    try {
        const buildDir = path.join(process.cwd(), 'build/static');

        await fs.mkdir(buildDir, { recursive: true });
        await fs.writeFile(
            path.join(buildDir, 'site.webmanifest'),
            JSON.stringify(manifest, null, 2)
        );
        console.log(`\n✓ \x1b[30mProcessed: \x1b[32m site.webmanifest generated successfully ✨\x1b[0m`);
    } catch (error) {
        console.error('Error generating site.webmanifest:', error);
    }
}

export default buildWebManifest;