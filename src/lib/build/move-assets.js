import fs from 'fs-extra';
import path from 'path';

const moveAssets = async () => {
    const sourceDir = path.join(process.cwd(), 'public');
    const targetDir = path.join(process.cwd(), 'build');

    try {
        // Check if public directory exists
        const sourceExists = await fs.pathExists(sourceDir);
        if (!sourceExists) {
            console.log('Public directory not found');
            return;
        }

        // Remove existing build directory if it exists
        const targetExists = await fs.pathExists(targetDir);
        if (targetExists) {
            await fs.remove(targetDir);
        }
        
        // Copy entire public directory to build
        await fs.copy(sourceDir, targetDir);

        console.log(`✓ \x1b[30mProcessed: \x1b[32m Assets generated successfully ✨\x1b[0m`);
    } catch (err) {
        console.error('Error moving assets:', err);
        throw err;
    }
}

export default moveAssets;