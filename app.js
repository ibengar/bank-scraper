const express = require('express');
const app = express();
app.use(express.static('public'));
const http = require('http').Server(app);
const port = process.env.PORT || 1000;
// const ScraperBank = require("mutasi-scraper");
const ScraperBank = require("./lib/parser");
const fs = require("fs");
// const bca = require('nodejs-bca-scraper');
const logDir = 'data/account/';
const moment = require('moment');
const { chromium } = require('playwright');
const {UA} =require("./lib/helper/UA");

const axios = require('axios');
const HttpProxyAgent = require('http-proxy-agent');
const SocksProxyAgent = require('socks-proxy-agent');


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
app.get('/mutasi-bca', async (req, res) => {
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
app.get('/mutasi-bca-multi', async (req, res) => {
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

app.get('/mutasi-bca-playwright', async (req, res) => {
    const browser = await chromium.launch({
        userAgent: UA()
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        await (async () => {
            // await page.on("dialog", async (dialog) => {
            //     await dialog.accept();
            //     console.log(dialog.message())
            //     // res.status(400).json({ status: 'error', message: dialog.message() });
            // });

            await page.goto('https://ibank.klikbca.com/');
            await page.fill('#user_id', 'fidelcas1260');
            await page.fill('#pswd', '200122');
            await page.click('[value="LOGIN"]');

            await page.waitForLoadState('domcontentloaded');

            await page.screenshot({path: 'login.png'});
            // await page.screenshot({ path: 'example.png' });
            // await new Promise(resolve => setTimeout(resolve, 3000));

            await page.goto('https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm');

            await page.waitForLoadState('domcontentloaded');
            // await page.click(`[onclick="javascript:goToPage('accountstmt.do?value(actions)=acct_stmt');return false;"]`);
            // Click a link that opens a new page
            const [newPage] = await Promise.all([
                page.waitForEvent('popup'),
                await page.click(`[onclick="javascript:goToPage('accountstmt.do?value(actions)=acct_stmt');return false;"]`)
            ]);

            await newPage.waitForLoadState('domcontentloaded');

            await newPage.waitForSelector("#startDt");

            // await new Promise(resolve => setTimeout(resolve, 2000));
            await page.screenshot({path: 'mutation.png'});

            // await newPage.on("dialog", async (dialog) =>
            // {
            //     await dialog.accept();
            //     console.log(dialog.message())
            //     // res.status(400).json({ status: 'error', message: dialog.message() });
            // });

            await newPage.locator('#startDt').selectOption('27')
            await newPage.locator('#startMt').selectOption('3')
            await newPage.locator('#endDt').selectOption('27')
            await newPage.locator('#endMt').selectOption('3')

            await newPage.screenshot({path: 'fill-mutation.png'});


            // const elements = await newPage.$('table:nth-child(4) > tbody > tr:nth-child(2) > td');
            // await new Promise(resolve => setTimeout(resolve, 3000));
            // while (await page.locator('.foo .bar').first().isVisible()) { console.log('nice') }
            // await newPage.click(`[value="Statement Download"]`)
            // await newPage.locator('[name="value(startDt)"]').click();

            await newPage.locator('[name="value(submit1)"]').click();
            await newPage.waitForLoadState('domcontentloaded');

            await newPage.waitForSelector(`[bordercolor="#ffffff"]`);


            // console.log(elements)
            // await newPage.waitForLoadState('networkidle ');

            // newPage.on('domcontentloaded', async data => {
            //     // console.log(data)
            //     const html = await data.content();
            //     console.log(html);
            // });

            // await new Promise(resolve => setTimeout(resolve, 5000));

            // const [mPage] = await Promise.all([
            //     await newPage.waitForSelector(`table[bordercolor="#ffffff"]`, {state: "visible", timeout: 1000} ),
            //     // newPage.waitForEvent('popup'),
            //     await newPage.click(`[value="View Account Statement"]`)
            // ]);

            // console.log(mPage)

            // const pageText = await newPage.innerHTML('table')
            // console.log(pageText)
            //

            // await new Promise(resolve => setTimeout(resolve, 5000));

            // await newPage.waitForSelector(`table[bordercolor="#ffffff"]`);

            // await Promise.all([
            //     newPage.waitForNavigation({ url: newUrl }),
            //     newPage.reload(),
            // ]);
            // Get all popups when they open
            // newPage.on('popup', async popup => {
            //     await popup.waitForLoadState();
            //     console.log(await popup.title());
            // })
            // const [mutationPage] = await Promise.all([
                // context.waitForEvent('page'),
                // newPage.locator('a[target="_blank"]').click() // Opens a new tab
                // context.waitForEvent('page'),
                // newPage.waitForEvent('page'),
                // await newPage.click(`[onclick="return inquiry();"]`)
            // const navigationPromise = page.waitForNavigation({ url: '**/login' });
            // ])

            // await newPage.waitForLoadState('load');
            // console.log(await newPage.title());
            // await newPage.waitForURL('https://ibank.klikbca.com/accountstmt.do?value(actions)=acctstmtview');

            // const [mutationPage] = await Promise.all([
            //     newPage.waitForEvent('popup'),
            //     await newPage.click(`[onclick="return inquiry();"]`)
            // ]);
            // console.log(newPage);
            // await newPage.goto('https://ibank.klikbca.com/accountstmt.do?value(actions)=acct_stmt');
            // onclick="javascript:goToPage('accountstmt.do?value(actions)=acct_stmt');return false;"
            await newPage.screenshot({path: 'example1.png'});
            // await mPage.screenshot({path: 'example3.png'});
            // await mutationPage.screenshot({path: 'detail-mutation.png'});
            // await newPage.screenshot({ path: 'example.png' });
            // const data = await page.textContent('.data-table');
            // console.log(data);
            await new Promise(resolve => setTimeout(resolve, 5000));
            await page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout");
            await browser.close();

        })();
    } catch (error){
        console.log(error.toString())
        await page.goto(
            "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
            {
                waitUntil: "networkidle0",
            }
        );
        await browser.close();
    }

    res.json({
        status: 'good',
        message: 'ok',
    })
    // console.log(i)
})

app.get('/bca-proxy', async (req, res) => {



    const url = 'http://localhost:1000/mutasi-bca?from_date=28&from_month=3&to_date=28&to_month=3&user=didikurn0116&pass=170411'

    // make a request using a rotating proxy
    axios.get(url, {
        httpAgent: getNextHttpAgent(),
        httpsAgent: getNextHttpsAgent()
    })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });

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

const proxyList = [
    'http://vgfkyusq:h9bzem0wbdh0@45.67.3.74:6237',
    'http://vgfkyusq:h9bzem0wbdh0@45.67.2.21:5595',
    // add more proxies as needed
];

// rotate proxies before each request
const getNextProxy = () => {
    const proxyUrl = proxyList.shift(); // get the next proxy in the list
    proxyList.push(proxyUrl); // put the used proxy at the end of the list
    return proxyUrl;
};



// create an agent based on the proxy type
const getNextHttpAgent = () => {
    const proxyUrl = getNextProxy();
    return new HttpProxyAgent(proxyUrl);
};

const getNextHttpsAgent = () => {
    const proxyUrl = getNextProxy();
    const protocol = new URL(proxyUrl).protocol;
    if (protocol === 'socks:') {
        return new SocksProxyAgent(proxyUrl);
    } else {
        return new HttpProxyAgent(proxyUrl);
    }
};