const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium-min');

puppeteer.use(StealthPlugin());

export default async function handler(req, res) {
    // 1. Setup Chromium for Vercel
    const executablePath = await chromium.executablePath(
        `https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar`
    );

    const browser = await puppeteer.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
        executablePath: executablePath,
        headless: true,
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        // Target your profile
        const targetUser = "cyber_coder225";
        await page.goto(`https://www.instagram.com/${targetUser}/`, { 
            waitUntil: 'networkidle2' 
        });

        // Human-like delay (3 seconds)
        await new Promise(r => setTimeout(r, 3000));

        // Attempt Follow
        const result = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const fBtn = btns.find(b => b.innerText === 'Follow');
            if (fBtn) {
                fBtn.click();
                return "Followed Successfully";
            }
            return "Follow Button Not Found (Check Login)";
        });

        await browser.close();
        res.status(200).json({ status: "Success", result });

    } catch (err) {
        if (browser) await browser.close();
        res.status(500).json({ error: err.message });
    }
}
