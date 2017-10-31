const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const port = process.argv.find((arg) => arg.split(':')[0] === '--port').split(':')[1];
const app = express();

const PATH_TO_APP = 'src';

app.listen(port, () => {
    console.log(chalk.blue(`mockServer is now started`));
    console.log(chalk.blue(`Lets navigate to localhost:${port}`));
}).on('error', (e) => {
    if (e.code === "EADDRINUSE") {
        console.log(chalk.grey.bgRed('ERROR: Porten används redan'));
        console.log(chalk.grey.bgRed('Du kanske har en annan process på porten: ' + port));
        console.log(chalk.grey.bgRed('Döda den andra eller ändra min port i:' + __dirname + '/package.json'));
    } else {
        throw e;
    }
});

app.use(bodyParser.json());
app.use('/', express.static(PATH_TO_APP));

app.get('/api/web/*', (req, res) => {
    // Remove pre-string from API-path so it points to web/...
    const path = req.originalUrl.substr(5);
    setTimeout(() => {
        // Create own edge cases with specialdata, extra timeouts etc
        if (path === "web/issues?customerId=0") {
            setTimeout(() => {
                getMeSomeJSON(path + '.json', res);
            }, 3000);
        } else {
            getMeSomeJSON(path + '.json', res);
        }

    }, 200)
});
app.put('*', (req, res) => {
    setTimeout(() => {
        const path = req.originalUrl.substr(5);
        // Make requests get special data, else return 200 and the sent data
        if (path === "web/wallet") {
            getMeSomeJSON("web/put-responses/wallet.json", res);
        } else {
            res.status(200);
            res.send(req.body);
        }
    }, 1000);
});

app.delete('*', (req, res) => {
    setTimeout(() => {
        res.status(200);
        res.send(req.body);
    }, 1000);
});

app.post('*', (req, res) => {
    setTimeout(() => {
        const path = req.originalUrl.substr(5);
        console.log(path);
        if (path === "web/customer") {
            getMeSomeJSON("web/post-responses/customer.json", res);
        } else {
            res.status(200);
            res.send(req.body);
        }
    }, 1000);
});

function getMeSomeJSON(fileName, res, status) {
    try {
        const fullFilepath = __dirname + '/data/' + fileName;
        fs.readFile(fullFilepath, (err, filecontent) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    const questionMarkIndex = fileName.indexOf('?');
                    if (questionMarkIndex !== -1) {
                        const tryAgainFilename = fileName.slice(0, questionMarkIndex) + '.json';
                        console.log("Fann inte error");
                        console.log(tryAgainFilename);
                        console.log(chalk.yellow(`Datafilen fanns inte. Men urlen innehöll ett ` + chalk.black.bgRed('frågetecken') + ` så jag försöker igen med: ${tryAgainFilename}`));
                        return getMeSomeJSON(tryAgainFilename, res, status);
                    }
                }
                res.status(404);
                res.send(null);
                return;
            }
            console.log(chalk.green('Sending ' + fileName));
            if (status) {
                res.status(status);
            }
            res.header('Content-Type', 'application/json');
            res.send(filecontent.toString());
        });
    } catch (e) {
        console.log('File not found:', e.stack);
    }
}

function getMeFile(fileName, res) {
    try {
        const fullFilepath = __dirname + '/data/' + fileName;
        fs.readFile(fullFilepath, (err, filecontent) => {
            if (err) {
                res.status(500);
                res.send(null);
                return;
            }
            console.log('Sending ' + fullFilepath);
            res.send(filecontent);
        });
    } catch (e) {
        console.log('File not found:', e.stack);
    }
}
