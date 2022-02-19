const express = require('express');
const fs = require('fs');

const app = express();

const PORT = process.env.port || 3000;

// Render index.html on browser 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/video', (req, res) => {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    
    if (!range) {
        res.status(400).send('Requires range header');
    }

    // get video stats
    const videoPath = 'bigbuck.mp4';
    const videoSize = fs.statSync(videoPath).size;

    const CHUNK_SIZE = 10 ** 6; // 1MB (in bytes)
    const start = Number(range.replace(/\D/g, '')); 
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Response header
    const contentLength =  end - start + 1;
    const header = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4',
    };

    res.writeHead(206, header);
    const videoStream = fs.createReadStream(videoPath, { start, end });

    videoStream.pipe(res);
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))