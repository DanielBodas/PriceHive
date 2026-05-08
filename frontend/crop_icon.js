const sharp = require('sharp');
const fs = require('fs');

async function processIcon() {
    const inputPath = 'public/icon.png';
    const outputPath = 'public/icon_cropped.png';

    try {
        console.log('Cropping icon...');
        // Trim transparent pixels and resize slightly to ensure it fills the space
        await sharp(inputPath)
            .trim() // Removes transparent padding
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(outputPath);
        
        console.log('Successfully cropped icon.png to icon_cropped.png');
        
        // Overwrite original
        fs.renameSync(outputPath, inputPath);
        
        // Also update logo192.png just in case it is used
        await sharp(inputPath)
            .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile('public/logo192.png');
            
        console.log('Done processing icons.');
    } catch (err) {
        console.error('Error processing icon:', err);
    }
}

processIcon();
