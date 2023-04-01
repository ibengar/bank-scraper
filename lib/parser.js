const { load } = require("cheerio");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
const {UA} =require("./helper/UA");
puppeteer.use(stealthPlugin());

class ScraperBank {
  constructor(user, pass, args = {}) {
    this.user = user || "username";
    this.pass = pass || "pass";
    this.konfigbrowser = {
      headless: false || args.headless,
      viewport: {
        width: 0,
        height: 0,
      },
      args: [
        '--log-level=3', // fatal only
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-infobars',
        '--disable-web-security',
        '--disable-site-isolation-trials',
        '--no-experiments',
        '--ignore-gpu-blacklist',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--mute-audio',
        '--disable-extensions',
        '--no-sandbox',

        '--no-first-run',
        '--no-zygote'
      ],
      executablePath: executablePath("chrome"),
      disablegpu: true,
    };
  }

  async getBCABalance(res) {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();
    // await page.evaluateOnNewDocument(() => {
    //   delete navigator.__proto__.webdriver;
    // });
    // await page.setRequestInterception(true);

    page.on("dialog", async (dialog) => {
      await dialog.accept();
      console.log(dialog.message())
      res.status(400).json({error : dialog.message()})
      return dialog.message()
      // throw new Error(dialog.message());
    });

    // page.on("request", (request) => {
    //   if (["image", "stylesheet", "font","script"].includes(request.resourceType())) {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    try {

      await page.setUserAgent(UA());
      await page.goto("https://ibank.klikbca.com/", {
        waitUntil: "domcontentloaded",
      });
      await page.setViewport({
        width: 1366,
        height: 635,
      });
      await page.type("#user_id", this.user);
      await page.type("#pswd", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      await page.goto(
          "https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm",
          {
            waitUntil: "domcontentloaded",
          }
      );

      // await page.screenshot({path: 'account_information_menu.png'});

      await page.waitForSelector("tr:nth-child(4) a");
      // await page.waitForSelector("table tr td:nth-child(2)");
      await page.click("tr:nth-child(4) a");
      // await page.click("table tr td:nth-child(2)");

      const pageTarget = page.target();
      const newTarget = await browser.waitForTarget(
          (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();
      await newPage.setUserAgent(UA());

      newPage.on("dialog", async (dialog) => {
        await dialog.accept();
        console.log(dialog.message())
        res.status(400).json({error : dialog.message()})
        // throw new Error(dialog.message());
      });

      const value = await newPage.evaluate(() => {
           const val1 = document.querySelectorAll('table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(1) > div > font')[0].innerHTML
           const val2 = document.querySelectorAll('table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(2) > div > font')[0].innerHTML
           const val3 = document.querySelectorAll('table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(3) > div > font')[0].innerHTML
           const val4 = document.querySelectorAll('table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(4) > div > font')[0].innerHTML
           return [val1, val2, val3, val4]
        }
      );

      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "domcontentloaded",
          }
      );
      await browser.close();
      return value;
    } catch (error) {
      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "networkidle0",
          }
      );
      await browser.close();
      return error;
    }
  }
  async getBCAMutation(tglawal, blnawal, tglakhir, blnakhir, res) {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();

    // await page.evaluateOnNewDocument(() => {
    //   delete navigator.__proto__.webdriver;
    // });
    // await page.setRequestInterception(true);

    // page.on("request", (request) => {
    //   if (["image", "stylesheet", "font","script"].includes(request.resourceType())) {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    try {

      await page.on("dialog", async (dialog) => {
        await dialog.accept();
        console.log(dialog.message())
        res.status(400).json({ status: 'error', message: dialog.message() });
      });

      await page.setUserAgent(UA());
      await page.goto("https://ibank.klikbca.com/", {
        waitUntil: "domcontentloaded",
      });
      // Wait for the specified time interval before navigating to the next page
      // await new Promise(resolve => setTimeout(resolve, timeInterval));

      await page.setViewport({
        width: 1366,
        height: 635,
      });
      await page.type("#user_id", this.user);
      await page.type("#pswd", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      await page.goto(
          "https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm",
          {
            waitUntil: "domcontentloaded",
          }
      );
      // Wait for the specified time interval before navigating to the next page
      // await new Promise(resolve => setTimeout(resolve, timeInterval));

      await page.waitForSelector("tr:nth-child(2) a");
      await page.click("tr:nth-child(2) a");
      const pageTarget = page.target();
      const newTarget = await browser.waitForTarget(
          (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();


      await newPage.waitForSelector("#startDt", {
        timeout: 5000,
        waitUntil: "domcontentloaded",
      });

      // Wait for the specified time interval before navigating to the next page
      // await new Promise(resolve => setTimeout(resolve, timeInterval));

      await newPage.on("dialog", async (dialog) =>
      {
        await dialog.accept();
        console.log(dialog.message())
        res.status(400).json({ status: 'error', message: dialog.message() });
      });

      await newPage.select("#startDt", tglawal.padStart(2, "0"));
      await newPage.select("#startMt", blnawal.toString());
      await newPage.select("#endDt", tglakhir.padStart(2, "0"));
      await newPage.select("#endMt", blnakhir.toString());
      await newPage.waitForSelector(
          "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );

      await newPage.click(
          "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );

      // await newPage.screenshot({path: 'mutation-fill.png'});

      // Wait for the new page to load
      await newPage.waitForSelector(`table[bordercolor="#ffffff"] tr` , {
        timeout: 10000,
        waitUntil: "domcontentloaded"
      })


      // await newPage.screenshot({path: 'mutation-result.png'});

      const result = await newPage.evaluate(() => document.body.innerHTML);
      const $ = load(result);

      const settlements = [];
      $('table[bordercolor="#ffffff"] tr').each((i, row) => {
        if (i === 0) return; // skip table header row
        const settlement = {
          tanggal: $(row).find("td").eq(0).text().trim(),
          keterangan: $(row).find("td").eq(1).text().trim(),
          cab: $(row).find("td").eq(2).text().trim(),
          nominal: $(row).find("td").eq(3).text().trim(),
          mutasi: $(row).find("td").eq(4).text().trim(),
          saldoakhir: $(row).find("td").eq(5).text().trim(),
        };
        settlements.push(settlement);
      });
      // console.log(settlements)
      let hasilnya = [];
      for(let i = 0; i < settlements.length; i++) {
        if(settlements[i].mutasi === "") {

        }else{
          hasilnya.push(settlements[i]);
        }
      }

      // Wait for the specified time interval before navigating to the next page
      // await new Promise(resolve => setTimeout(resolve, timeInterval));
      // console.log(hasilnya)
      // await newPage.waitForSelector('table[bordercolor="#ffffff"] tr', {timeout: 2000});
      // await new Promise(resolve => setTimeout(resolve, 2500));
      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "domcontentloaded",
          }
      );
      await browser.close();
      return hasilnya;
    } catch (error) {
      console.log(error.toString());
      res.status(400).json({ status: 'error', message: error.toString() });
      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "networkidle0",
          }
      );
      await browser.close();
      return error;
    }
  }
  async getBCAMutationMultiAccount(tglawal, blnawal, tglakhir, blnakhir, res) {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();

    // await page.evaluateOnNewDocument(() => {
    //   delete navigator.__proto__.webdriver;
    // });
    // await page.setRequestInterception(true);

    // page.on("request", (request) => {
    //   if (["image", "stylesheet", "font","script"].includes(request.resourceType())) {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    try {

      await page.on("dialog", async (dialog) => {
        await dialog.accept();
        console.log(dialog.message())
        // res.status(400).json({ status: 'error', message: dialog.message() });
      });

      await page.setUserAgent(UA());
      await page.goto("https://ibank.klikbca.com/", {
        waitUntil: "domcontentloaded",
      });
      await page.setViewport({
        width: 1366,
        height: 635,
      });
      await page.type("#user_id", this.user);
      await page.type("#pswd", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      await page.goto(
          "https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm",
          {
            waitUntil: "domcontentloaded",
          }
      );

      await page.waitForSelector("tr:nth-child(2) a");
      await page.click("tr:nth-child(2) a");
      const pageTarget = page.target();
      const newTarget = await browser.waitForTarget(
          (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();
      await newPage.setUserAgent(UA());

      // await new Promise(resolve => setTimeout(resolve, 5000));

      await newPage.waitForSelector("#startDt", {
        timeout: 5000,
        waitUntil: "domcontentloaded",
      });

      await newPage.on("dialog", async (dialog) =>
      {
        await dialog.accept();
        console.log(dialog.message())
        // res.status(400).json({ status: 'error', message: dialog.message() });
      });

      await newPage.select("#startDt", tglawal.padStart(2, "0"));
      await newPage.select("#startMt", blnawal.toString());
      await newPage.select("#endDt", tglakhir.padStart(2, "0"));
      await newPage.select("#endMt", blnakhir.toString());
      await newPage.waitForSelector(
          "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );
      await newPage.click(
          "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );

      // await newPage.screenshot({path: 'mutation.png'});

      // await new Promise(resolve => setTimeout(resolve, 1000));

      await newPage.waitForSelector(`table[bordercolor="#ffffff"] tr` , {
        timeout: 5000,
        waitUntil: "domcontentloaded"
      });

      // await newPage.screenshot({path: 'mutation2.png'});

      const result = await newPage.evaluate(() => document.body.innerHTML);
      const $ = load(result);

      const settlements = [];
      $('table[bordercolor="#ffffff"] tr').each((i, row) => {
        if (i === 0) return; // skip table header row
        const settlement = {
          tanggal: $(row).find("td").eq(0).text().trim(),
          keterangan: $(row).find("td").eq(1).text().trim(),
          cab: $(row).find("td").eq(2).text().trim(),
          nominal: $(row).find("td").eq(3).text().trim(),
          mutasi: $(row).find("td").eq(4).text().trim(),
          saldoakhir: $(row).find("td").eq(5).text().trim(),
        };
        settlements.push(settlement);
      });
      // console.log(settlements)
      let hasilnya = [];
      for(let i = 0; i < settlements.length; i++) {
        if(settlements[i].mutasi === "") {

        }else{
          hasilnya.push(settlements[i]);
        }
      }
      // console.log(hasilnya)
      // await newPage.waitForSelector('table[bordercolor="#ffffff"] tr');
      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "domcontentloaded",
          }
      );
      await browser.close();
      return hasilnya;
    } catch (error) {
      // console.log(error.toString());
      // console.log(error.name.toString());
      // console.log(error.message.toString());
      // res.status(400).json({ status: 'error', message: error.toString() });
      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "networkidle0",
          }
      );
      await browser.close();
      return error;
    }
  }
  async getBCAMutationOri(tglawal, blnawal, tglakhir, blnakhir) {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();
    // await page.evaluateOnNewDocument(() => {
    //   delete navigator.__proto__.webdriver;
    // });
    // await page.setRequestInterception(true);
    page.on("dialog", async (dialog) => {
      await dialog.accept();
      throw new Error(dialog.message());
    });

    // page.on("request", (request) => {
    //   if (["image", "stylesheet", "font","script"].includes(request.resourceType())) {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    try {
      await page.setUserAgent(UA());
      await page.goto("https://ibank.klikbca.com/", {
        waitUntil: "domcontentloaded",
      });
      await page.setViewport({
        width: 1366,
        height: 635,
      });
      await page.type("#user_id", this.user);
      await page.type("#pswd", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      await page.goto(
          "https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm",
          {
            waitUntil: "domcontentloaded",
          }
      );

      await page.waitForSelector("tr:nth-child(2) a");
      await page.click("tr:nth-child(2) a");
      const pageTarget = page.target();
      const newTarget = await browser.waitForTarget(
          (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();
      await newPage.setUserAgent(UA());
      await newPage.waitForSelector("#startDt", {
        waitUntil: "domcontentloaded",
      });
      newPage.on("dialog", async (dialog) => {
        await dialog.accept();
        throw new Error(dialog.message());
      });

      await newPage.select("#startDt", tglawal.padStart(2, "0"));
      await newPage.select("#startMt", blnawal.toString());
      await newPage.select("#endDt", tglakhir.padStart(2, "0"));
      await newPage.select("#endMt", blnakhir.toString());
      await newPage.waitForSelector(
          "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );
      await newPage.click(
          "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );

      await new Promise(resolve => setTimeout(resolve, 2000));

      await newPage.waitForSelector('table[bordercolor="#ffffff"] tr' , {
        waitUntil: "domcontentloaded"
      });
      const result = await newPage.evaluate(() => document.body.innerHTML);
      const $ = load(result);

      const settlements = [];
      $('table[bordercolor="#ffffff"] tr').each((i, row) => {
        if (i === 0) return; // skip table header row
        const settlement = {
          tanggal: $(row).find("td").eq(0).text().trim(),
          keterangan: $(row).find("td").eq(1).text().trim(),
          cab: $(row).find("td").eq(2).text().trim(),
          nominal: $(row).find("td").eq(3).text().trim(),
          mutasi: $(row).find("td").eq(4).text().trim(),
          saldoakhir: $(row).find("td").eq(5).text().trim(),
        };
        settlements.push(settlement);
      });
      console.log(settlements)
      let hasilnya = [];
      for(let i = 0; i < settlements.length; i++) {
        if(settlements[i].mutasi === "") {

        }else{
          hasilnya.push(settlements[i]);
        }
      }
      await newPage.waitForSelector('table[bordercolor="#ffffff"] tr');
      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "domcontentloaded",
          }
      );
      await browser.close();
      return hasilnya;
    } catch (error) {
      await page.goto(
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
          {
            waitUntil: "networkidle0",
          }
      );

      await browser.close();
      return error;
    }
  }
  async getBNI() {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
    });
    //We
    try {
      await page.goto("https://ibank.bni.co.id/MBAWeb/FMB");

      await page.waitForSelector("#RetailUser_table #RetailUser");
      await page.click("#RetailUser_table #RetailUser");
      await page.waitForSelector("#s1_table #CorpId");
      await page.click("#s1_table #CorpId");
      await page.type("#s1_table #CorpId", this.user);
      await page.waitForSelector("#s1_table #PassWord");
      await page.click("#s1_table #PassWord");
      await page.type("#s1_table #PassWord", this.pass);
      await page.keyboard.press("Enter");
      try {
        await page.waitForSelector("#Display_MConError");
        let checklogin = await page.$('#Display_MConError');

        const err =  await page.evaluate(el => el.textContent, checklogin)
        //console.log(err)
        await browser.close()
        return {
          error: err.split("." )[1].split(".")[0]
        }
      } catch {


      }
      await page.waitForSelector("#MBMenuList");
      await page.click("#MBMenuList");
      await page.waitForSelector("#AccountMenuList_table #AccountMenuList");
      const elements = await page.$x("//*[contains(text(),'MUTASI')]");
      await elements[0].click();
      await page.waitForSelector("#MAIN_ACCOUNT_TYPE");
      await page.select("#MAIN_ACCOUNT_TYPE", "OPR");
      await page.click("#AccountIDSelectRq");
      await page.waitForSelector("#Search_Option_6");
      await page.select("#TxnPeriod", "Today");
      await page.click("#FullStmtInqRq");
      await page.waitForTimeout(2000);
      await page.waitForSelector("table > tbody > tr")
      const result = await page.$$eval("table > tbody > tr", (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll("td");
          return Array.from(columns, (column) => column.innerText);
        });
      });
      let arrayfilter = [];
      for (let i = 0; i < result.length; i++) {
        const filtered = result[i].filter(function (el) {
          return el != "";
        });
        if (filtered.length > 0) {
          arrayfilter.push(filtered);
        }
      }
      await page.waitForSelector("#LogOut");
      await page.click("#LogOut");
      await page.waitForSelector("#__LOGOUT__");
      await page.click("#__LOGOUT__");
      await browser.close();

      let arr = []
      var res = arrayfilter.slice(6, -7);
      var string = res.join("\n");
      var potong = string.split("Tanggal Transaksi");
      for (let i = 1; i < potong.length; i++) {
        let potong2 = potong[i].split("\n");
        let mutasi;
        if(potong2[5] === "Cr"){
          mutasi = "CR"
        }else if(potong2[5] === "Db"){
          mutasi = "DB"
        }
        arr.push(
            {
              tanggal: potong2[1]
              , keterangan: potong2[3]
              , mutasi: mutasi
              , nominal: potong2[7]
              , saldoakhir: potong2[9]
            })
      }
      return arr;
    }
    catch (error) {
      console.log(error);
    }
  }
  async getDanamon() {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();
    try {
      await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_new.aspx");
      await page.setViewport(
          {
            width: 1536
            , height: 731
          });
      await page.waitForSelector("#txtAccessCode");
      await page.type("#txtAccessCode", this.user);
      await page.type("#txtPin", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForSelector("#frmDefault > div > div.transaction-area > div.ld-menu");
      await page.goto("https://www.danamonline.com/onlinebanking/default.aspx?usercontrol=DepositAcct/dp_TrxHistory_new");
      await page.waitForSelector("#_ctl0_btnGetDetails");
      await page.select("#_ctl0_ddlTrxPeriod", "10 Hari Terakhir");
      await page.click("#_ctl0_btnGetDetails");
      await page.waitForTimeout(2000);
      const result = await page.evaluate(() => document.body.innerHTML);
      await page.waitForTimeout(2000);
      await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");
      await browser.close();
      if (result.includes("Tidak ditemukan data")) {
        return {
          message: "Tidak ditemukan data"
        };
      }
      else {
        const res = await page.$$eval("#_ctl0_dgList > tbody > tr", (rows) => {
          return Array.from(rows, (row) => {
            const columns = row.querySelectorAll("td");
            return Array.from(columns, (column) => column.innerText);
          });
        });
        return res.slice(1);
      }
    }
    catch (error) {
      console.log(error);
      await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");
    }
  }
}
module.exports = ScraperBank;
