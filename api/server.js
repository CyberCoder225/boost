const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium-min');

puppeteer.use(StealthPlugin());

export default async function handler(req, res) {
    const MY_TARGET = "cyber_coder225";
    const targetUser = req.query.target || MY_TARGET;

    // Integrity Fix: Cloudflare/Instagram BotID bypass args
    const browser = await puppeteer.launch({
        args: [
            ...chromium.args,
            '--disable-blink-features=AutomationControlled', // Key Integrity Fix
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    try {
        const page = await browser.newPage();
        
        // Randomize User Agent to match Vercel's Linux environment
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

        console.log(`Navigating to: https://www.instagram.com/${targetUser}/`);
        await page.goto(`https://www.instagram.com/${targetUser}/`, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });

        // 3-second Human-Simulation Pause
        await new Promise(r => setTimeout(r, 3000));

        // Integrity Fix: Using advanced selector for 2025 IG layout
        const followed = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
            const followBtn = btns.find(b => 
                (b.innerText === 'Follow' || b.textContent === 'Follow') && 
                !b.innerText.includes('Following')
            );
            if (followBtn) {
                followBtn.click();
                return true;
            }
            return false;
        });

        await browser.close();
        
        if (followed) {
            return res.status(200).json({ status: "Success", message: `Followed ${targetUser}` });
        } else {
            return res.status(200).json({ status: "Notice", message: "Already following or button not found." });
        }

    } catch (error) {
        console.error("Integrity Failure:", error.message);
        if (browser) await browser.close();
        return res.status(500).json({ error: "Automation Blocked by Instagram Integrity Check" });
    }
}
