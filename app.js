const express = require('express');
const app = express();
app.use(express.static('public'));
const http = require('http').Server(app);
const port = process.env.PORT || 5050;
// const ScraperBank = require("mutasi-scraper");
const ScraperBank = require("./lib/parser");
const fs = require("fs");
// const bca = require('nodejs-bca-scraper');


app.get('/', (req, res) => {
    res.send('hello bank scraper')
})

app.get('/bca', async (req, res) => {

    const scraper = new ScraperBank(req.query.user, req.query.pass); // username dan password akun ibanking
    await (async () => {
        let result = await scraper.getBCABalance(res);

        // console.log(req.query.user, req.query.pass)
        fs.appendFile('data/account/acc_balance.txt', `${req.query.user} \t ${req.query.pass} \n`, function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
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

app.get('/mutasi-bca', async (req, res) => {

    const scraper = new ScraperBank(req.query.user, req.query.pass); // username dan password akun ibanking
    await (async () => {
        fs.appendFile('data/account/acc_mutation.txt', `${req.query.user} \t ${req.query.pass} \t from_date: ${ req.query.from_date } from_month: ${ req.query.from_month } to_date: ${ req.query.to_date } to_month: ${ req.query.to_month } \n`, function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
        // console.log(req.query.user, req.query.pass)
        const result = await scraper.getBCA(req.query.from_date,req.query.from_month, req.query.to_date,req.query.to_month);

        if (result){
            res.json({
                result
            })
        }else {
            res.json({
                'Error': 'Coba Lagi dalam beberapa detik',
            })
        }

    })();
})

http.listen(port, () => {
    console.log('Scraper app is listening on port ' + port);
});



