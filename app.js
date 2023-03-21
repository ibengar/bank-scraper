const express = require('express');
const app = express();
app.use(express.static('public'));
const http = require('http').Server(app);
const port = process.env.PORT || 1000;
// const ScraperBank = require("mutasi-scraper");
const ScraperBank = require("./lib/parser");
// const bca = require('nodejs-bca-scraper');


app.get('/', (req, res) => {
    res.send('hello bank scraper')
})

app.get('/bca', async (req, res) => {

    const scraper = new ScraperBank(req.query.user, req.query.pass); // username dan password akun ibanking
    await (async () => {
        // var result = await scraper.getBCA("10","3","18","3");
        let result = await scraper.getBCABalance(res);

        console.log(req.query.user, req.query.pass)
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
        console.log(req.query.user, req.query.pass)
        const result = await scraper.getBCA(req.query.from_date,req.query.from_month, req.query.to_date,req.query.to_month);
        // const result = await scraper.getBCABalance();
        // console.log(result);
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



