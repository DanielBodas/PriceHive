const sharp = require('sharp');

async function processIcon() {
    const inputPath = 'public/icon.png';
    const outputPath = 'public/favicon.png';

    try {
        console.log('Generating isolated favicon...');
        await sharp(inputPath)
            .trim()
            .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(outputPath);
        
        console.log('Successfully created favicon.png without overwriting icon.png');
    } catch (err) {
        console.error('Error processing icon:', err);
    }
}

processIcon();
