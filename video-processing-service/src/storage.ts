import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { raw } from 'express';

const storage = new Storage();

const rawVideoBucket = 'ad-yt-clone-raw-videos';
const processedVideoBucket = 'ad-yt-clone-processed-videos';

const localInputDirectory = './raw-videos';
const localOutputDirectory = './processed-videos';

/**
 * Creates the local directories for new and processed videos.
 */
export function setupDirectories(){
    makeDirectory(localInputDirectory);
    makeDirectory(localOutputDirectory);
}

/**
 * @param fileName - The name of the file to download from the {@link rawVideoBucket} bucket into {@link localInputDirectory} folder
 * @returns A promise that resolves when the file has been downloaded
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucket).file(fileName).download({
        destination: `${localInputDirectory}/${fileName}`
    })
    console.log(
        `Downloaded gs://${rawVideoBucket}/${fileName} to ${localInputDirectory} folder`
    )
}

/**
 * @param rawVideoName - The name of the raw video file to convert from {@link localInputDirectory}
 * @param processedVideoName - The name of the processed video file to save to {@link localOutputDirectory}
 * @returns A promise that resolves when the video has been converted
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localInputDirectory}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360")
        .on("end", () => {
            console.log('Processing finished successfully');
            resolve();
        })
        .on("error", (err) => {
            console.error("Error processing video:", err);
            reject(err);
        }).save(`${localOutputDirectory}/${processedVideoName}`); // converting it to 360p
    })
}

/**
 * @param fileName - The name of the processed video file to upload to {@link processedVideoBucket} bucket
 * @returns A promise that resolves when the video has been uploaded
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucket);
    await bucket.upload(`${localOutputDirectory}/${fileName}`, {
        destination: fileName
    })
    console.log(`Uploaded ${localInputDirectory}/${fileName} to gs://${processedVideoBucket}/${fileName} bucket`);
    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the processed video file to delete from {@link localInputDirectory} bucket
 * @returns A promise that resolves when the video has been deleted
 */
export async function deleteRawVideo(fileName: string) {
    await deleteVideo(`${localInputDirectory}/${fileName}`);
}

/**
 * @param fileName - The name of the processed video file to delete from {@link localOutputDirectory} folder
 * @returns A promise that resolves when the video has been deleted
 */
export async function deleteProcessedVideo(fileName: string) {
    await deleteVideo(`${localOutputDirectory}/${fileName}`);
}

/**
 * @param filePath - path to delete
 * @returns A promise that resolves when the file has been deleted
 */
function deleteVideo(filePath: string) {
    return new Promise<void>((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Error deleting file at ${filePath}`, err);
                    reject(err);
                }
                else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath} skipping deletion`);
            resolve();
        }
        
    })
}

/**
 * directoryName - The name of the directory to make
 */
export function makeDirectory(directoryName: string) {
    if (!fs.existsSync(directoryName)) {
        fs.mkdirSync(directoryName);
    }
}