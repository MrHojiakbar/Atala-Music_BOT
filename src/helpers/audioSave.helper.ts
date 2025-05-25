import { createWriteStream, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { get } from 'https';

export async function saveAudioFile(fileId: string, href: string) {
    return new Promise((resolve, reject) => {

        const fileName = `${fileId}-${Date.now()}.mp3`;
        const filePath = join(process.cwd(), 'static', 'music', fileName);
        mkdirSync(dirname(filePath), { recursive: true });

        const file = createWriteStream(filePath);
        let downloadedBytes = 0;
        const startTime = Date.now();

        get(href, (res) => {
            res.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = (downloadedBytes / (1024 * 1024)) / elapsed;
                console.log(
                    `${(downloadedBytes / (1024 * 1024)).toFixed(2)} MB | ` +
                    `${speed.toFixed(2)} MB/s | ` +
                    `${elapsed.toFixed(1)} s`
                );
            });

            res.pipe(file);

            file.on('finish', () => {
                console.log('✅ Audio saqlandi:', filePath);
                resolve({
                    message: 'success',
                    filePath,
                    size: `${(downloadedBytes / (1024 * 1024)).toFixed(2)} MB`,
                    duration: `${((Date.now() - startTime) / 1000).toFixed(1)} s`
                });
            });

            res.on('error', reject);
            file.on('error', reject);
        }).on('error', reject);
    });
}
