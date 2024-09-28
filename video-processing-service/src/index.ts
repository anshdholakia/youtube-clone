import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { setupDirectories, downloadRawVideo, convertVideo, deleteRawVideo, deleteProcessedVideo, uploadProcessedVideo } from './storage';

setupDirectories()

const app = express();
app.use(express.json());

app.post('/process-video', async (req, res)=>{
    // Get the bucket and fileName from the cloud pubsub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString();
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received');
        }
    } catch (error) {
        console.error('Error parsing message', error);
        res.status(400).send('Invalid message payload received');
        return;
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Download the raw video from google cloud storage
    await downloadRawVideo(inputFileName);

    // Convert the raw video to 360p
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (error) {
        // Delete the processed file as well just in case it failed midway
        await Promise.all([deleteRawVideo(inputFileName), deleteProcessedVideo(outputFileName)]);
        console.error('Error converting video', error);
        res.status(500).send('Error converting video');
        return;
    }

    // Upload the processed video to google cloud storage
    await uploadProcessedVideo(outputFileName);
    await Promise.all([deleteRawVideo(inputFileName), deleteProcessedVideo(outputFileName)]); // Delete the raw and processed videos together
    res.status(200).send('Video processed successfully');
    return;
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing service app listening on http://localhost:${port}`);
})