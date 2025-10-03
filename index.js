import createTorrent from "create-torrent";
import handbrakeJs from "handbrake-js";
import fs from "fs";

const files = fs.readdirSync('./in')
console.log(files)

const jobs = []

for (let file of files) {
    const id = file.split('.')[0] // before .mp4
    jobs.push({
        id: id,
        file: file,
    })
}

let currentJob = jobs.pop() // load first job

encode()

function encode(){
    handbrakeJs.spawn({
        input: `./in/${currentJob.file}`,
        output: `./out/${currentJob.id}.mp4`,
        encoder: "nvenc_h264",
        "encoder-preset": "slowest",
        "ab": 64, // audio bitrate
        quality: 30,
        audio: 1,
        maxHeight: 720,
        "non-anamorphic": true,
        optimize: true, // optimize for web https stream
    })
        .on("progress", progress => {
            console.log(
                `${currentJob.id} | Progreso: ${progress.percentComplete}%`
            );
        })
        .on("complete", onComplete)
        .on("error", err => {
            console.log(currentJob);
            console.error("Error:", err);
        });
}



function onComplete() {
    console.log("Conversión terminada!");
    createTorrent(
        `./out/${currentJob.id}.mp4`,
        {
            pieceLength: 1_048_576, // 1MB
        },
        (err, torrent) => {
            // console.log('cb invoked')
            // console.log('err', err)
            // console.log('trr', torrent)
            if (!err) {
                // `torrent` is a Buffer with the contents of the new .torrent file
                fs.writeFile(`./out/${currentJob.id}.torrent`, torrent, (cb)=>{
                    // console.log('written!')
                })
                console.log('Torrent created successfully!');

                // go to next job
                if(jobs.length > 0){
                    currentJob = jobs.pop();
                    encode()
                }
            }
        }
    )
}

