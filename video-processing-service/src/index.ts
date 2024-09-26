import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
app.use(express.json());

app.post('/process-video', (req, res)=>{
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send('Input and output file paths are required');
    }

    ffmpeg(inputFilePath).outputOptions("-vf", "scale=-1:360")
    .on("end", () => {
        console.log('Processing finished successfully');
        res.status(200).send('Processing finished successfully');
    })
    .on("error", (err) => {
        console.error("Error processing video:", err);
        res.status(500).send("Error processing video");
    }).save(outputFilePath); // converting it to 360p
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing service app listening on http://localhost:${port}`);
})