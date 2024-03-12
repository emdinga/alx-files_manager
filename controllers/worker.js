import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';
import fs from 'fs';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
    const { fileId, userId } = job.data;

    if (!fileId) {
        throw new Error('Missing fileId');
    }

    if (!userId) {
        throw new Error('Missing userId');
    }

    const filesCollection = dbClient.client.db().collection('files');
    const file = await filesCollection.findOne({ _id: fileId, userId });

    if (!file) {
        throw new Error('File not found');
    }

    if (file.type === 'image' && file.localPath) {
        try {
            const thumbnail500 = await imageThumbnail(file.localPath, { width: 500 });
            const thumbnail250 = await imageThumbnail(file.localPath, { width: 250 });
            const thumbnail100 = await imageThumbnail(file.localPath, { width: 100 });

            const thumbnails = [
                { data: thumbnail500, width: 500 },
                { data: thumbnail250, width: 250 },
                { data: thumbnail100, width: 100 }
            ];

            for (const thumbnail of thumbnails) {
                const thumbnailFileName = `${file.localPath}_${thumbnail.width}`;
                fs.writeFileSync(thumbnailFileName, thumbnail.data);
            }
        } catch (error) {
            console.error('Thumbnail generation error:', error);
        }
    }
});
