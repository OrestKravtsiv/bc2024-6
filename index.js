const express = require('express');
const app = express();
const { program } = require('commander');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const upload = multer();

app.use(express.text()); // так краще
// app.use(bodyParser.raw({ type: 'text/plain' })); 

//Налаштував потрібні аргументи
program
    .requiredOption('-h, --host <host>', 'address of the server')
    .requiredOption('-p, --port <port>', 'port of the server')
    .requiredOption('-c, --cache <path>', 'cache directory path')
    .configureOutput({
        outputError: (str, write) => {
            if (str.includes("-h")) console.error("Please, specify host address")
            else if (str.includes("-p")) console.error("Please, specify port")
            else if (str.includes("-c")) console.error("Please, specify cache path")

        }
    })
    .parse(process.argv);
//створив змінні для параметрів аргументів
const options = program.opts();
const host = options.host;
const port = options.port;
const cache = options.cache;

// GET /notes/<ім’я нотатки>
app.get('/notes/:name', (req, res) => {
    const noteName = req.params.name;
    try {
        const notePath = path.join(cache, `${noteName}.txt`);
        const noteContent = fs.readFileSync(notePath, 'utf8');
        res.send(noteContent);
        console.log(noteName);
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    };
});

// PUT /notes/<ім’я нотатки>
app.put('/notes/:name', upload.none(), (req, res) => {
    const noteName = req.params.name;
    const text = req.body;
    console.log(req.body);

    try {
        const notePath = path.join(cache, `${noteName}.txt`);
        fs.writeFileSync(notePath, text, 'utf8');
        res.status(200).send('Note updated');
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }


});

// DELETE /notes/<ім’я нотатки> 
app.delete('/notes/:name', (req, res) => {
    const { noteName } = req.params;
    try {
        const notePath = path.join(cache, `${noteName}.txt`);
        fs.unlinkSync(notePath);
        res.status(200).send('Note deleted');

    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// GET /notes
app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(cache)
        .map(file => {
            const name = file.slice(0, -4);
            const notePath = path.join(cache, `${name}.txt`);
            const text = fs.readFileSync(notePath, 'utf8');
            return { name, text };
        });
    res.status(200).json(notes);
});

// POST /write
app.post('/write', upload.none(), (req, res) => {
    const { note_name, note } = req.body;
    try {

        const notePath = path.join(cache, `${note_name}.txt`);
        if (fs.existsSync(notePath)) throw error;
        fs.writeFileSync(notePath, note, 'utf8');

        res.status(201).send('Created');

    }
    catch {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad request');
    }
});

app.get('/UploadForm.html', (req, res) => {
    const filePath = path.join(__dirname, 'UploadForm.html');
    res.sendFile(filePath);
});

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});