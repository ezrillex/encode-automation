import fs from 'fs';

const files = fs.readdirSync('./out')
console.log(files)

const names = files.map(file => {
    return file.split('.')[0]
})
const ids = [...new Set(names)]
console.log(ids)

for (const id of ids) {
    // check all files exist?
    const metaExists = fs.existsSync(`./out/${id}.meta.txt`)
    const videoExists = fs.existsSync(`./out/${id}.mp4`)
    const torrentExists = fs.existsSync(`./out/${id}.torrent`)
    if(metaExists && videoExists && torrentExists) {
        // load duration
        const duration = fs.readFileSync(`./out/${id}.meta.txt`, 'utf8');
        const durationInt = parseInt(duration)
        console.log(durationInt)
        // load torrent file
        const torrent = fs.readFileSync(`./out/${id}.torrent`, 'base64');
        console.log(torrent)
        // get file size in KB
        const fileStats = fs.statSync(`./out/${id}.mp4`);
        const fileSizeKB = Math.ceil(fileStats.size / 1024) ;
        console.log(fileSizeKB);

        // post to api
        const response = await fetch(process.env.api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // important!
                "Authorization": `Bearer ${process.env.api_token}`,
            },
            body: JSON.stringify({
                torrent: torrent,
                duration: durationInt,
                id: id,
                size: fileSizeKB,
            }),
        });
        console.log(id, response);
    }
    else{
        console.log('missing files for ', id)
    }
}