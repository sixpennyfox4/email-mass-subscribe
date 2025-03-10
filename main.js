const prompt = require("prompt-sync")();
const puppeteer = require("puppeteer");
const fs = require("fs");

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const firstName = prompt("First name: ");
const lastName = prompt("Second name: ");
const email = prompt("Target email: ");
console.log();

let websites = fs.readFileSync('list.txt', 'utf-8').split('\n')

function shuffle(a) {
    // Fisher-Yates shuffle (chatgpt)
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

websites = shuffle(websites);

const emailS = [
    'input[name="email"]',
    'input[name="EMAIL"]',
    'input[name="contact[email]"]'
];

const firstNameS = [
    'input[name="name"]',
    'input[name="NAME"]',
    'input[name="first_name"]',
    'input[name="FNAME"]',
    'input[name="firstname"]'
];

const lastNameS = [
    'input[name="lastname"]',
    'input[name="LNAME"]',
    'input[name="last_name"]'
];

async function fillF(page, selectors, value) {
    for (const s of selectors) {
        try {
            const e = await page.$(s);

            if (e) {
                await e.focus();
                await page.keyboard.type(value, { delay: 50 });

                break;
            }
        } catch (e) {}
    }
}

(async() => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    for (const url of websites) {
        console.log(`Current url: ${url}`);

        try {
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        } catch (e) {
            continue;
        }

        await wait(1000);

        await fillF(page, emailS, email);
        await fillF(page, firstNameS, firstName);
        await fillF(page, lastNameS, lastName);

        await page.keyboard.press("Enter");
        await wait(5000);

    }

    console.log("Finished!");
    await browser.close();
})()
