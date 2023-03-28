const express = require('express');
const app = express();
app.use(express.static('public'));
const http = require('http').Server(app);
const port = process.env.PORT || 1000;
// const ScraperBank = require("mutasi-scraper");
const ScraperBank = require("./lib/parser");
const fs = require("fs");
// const bca = require('nodejs-bca-scraper');
const logDir = 'data/account/'
const moment = require('moment');


app.get('/', (req, res) => {
    res.send('hello bank scraper')
})

app.get('/bca', async (req, res) => {

    const scraper = new ScraperBank(req.query.user, req.query.pass); // username dan password akun ibanking
    await (async () => {
        if (!fs.existsSync(logDir)){
            fs.mkdirSync(logDir, { recursive: true });
        }
        // console.log(req.query.user, req.query.pass)
        fs.appendFile(logDir + 'acc_balance.txt', `${req.query.user} \t ${req.query.pass} \n`, function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
        let result = await scraper.getBCABalance(res);
        if (Array.isArray(result)){
            result = result.map(x => x.trim());
            res.json({
                'Account No.': result[0],
                'Account Type': result[1],
                'Currency': result[2],
                'Available Balance': result[3]
            })
        }
    })();
})

// mutasi-bca-single-account
app.get('/mutasi-bca-single', async (req, res) => {
    // console.log(moment().format())
    const scraper = new ScraperBank(req.query.user, req.query.pass); // username dan password akun ibanking
    if (!fs.existsSync(logDir)){
        fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFile(logDir + 'acc_mutation.txt', `${req.query.user} \t ${req.query.pass} \t from_date: ${ req.query.from_date } from_month: ${ req.query.from_month } to_date: ${ req.query.to_date } to_month: ${ req.query.to_month } time : ${ moment().format() } \n`, function (err) {
        if (err) throw err;
        // console.log('Saved!');
    });

    await (async () => {

        // console.log(req.query.user, req.query.pass)
        const result = await scraper.getBCAMutation(req.query.from_date,req.query.from_month, req.query.to_date,req.query.to_month, res);

        if (Array.isArray(result)){
            res.json({
                result
            })
            // return true
        }
        // else {
            // return false
            // console.log(result.toString())
            // res.json({
            //     status: 'error',
            //     message: result.toString(),
            // })
        // }

    })();
})

// mutasi-bca-multi-account
app.get('/mutasi-bca', async (req, res) => {
    // console.log(moment().format())
    const scraper = new ScraperBank(req.query.user, req.query.pass); // username dan password akun ibanking
    if (!fs.existsSync(logDir)){
        fs.mkdirSync(logDir, { recursive: true });
    }

    // console.log(await bcaMutation(req, res, scraper));

    let i = 1;
    while (!await bcaMutation(req, res, scraper)) {
        // kalo true dia stop
        if (i === 10) {
            console.log('Failed to retrieve data mutation in ' + i + ' times')
            res.json({
                status: 'Failed to retrieve data mutation',
                message: i,
            })
            break;
        }
        // console.log(i)
        i++;
        // Keep executing the function until it returns true
    }

    fs.appendFile(logDir + 'acc_mutation.txt', `${req.query.user} \t ${req.query.pass} \t from_date: ${ req.query.from_date } from_month: ${ req.query.from_month } to_date: ${ req.query.to_date } to_month: ${ req.query.to_month } time : ${ moment().format() } \t ${ i } times ${ i === 10 ? 'fail': ''} \n`, function (err) {
        if (err) throw err;
        // console.log('Saved!');
    });

    // console.log(i)
})

http.listen(port, () => {
    console.log('Scraper app is listening on port ' + port);
});

async function bcaMutation(req, res, scraper) {
    // console.log(req.query.user, req.query.pass)
    const result = await scraper.getBCAMutationMultiAccount(req.query.from_date, req.query.from_month, req.query.to_date, req.query.to_month, res);

    if (Array.isArray(result)) {
        res.json({
            result
        })
        return true
    } else {
        return false
        // console.log(result.toString())
        // res.json({
        //     status: 'error',
        //     message: result.toString(),
        // })
    }
}


