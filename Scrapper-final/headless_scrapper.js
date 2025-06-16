const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

(async () => {
    try {
        // Record the start time

        // Launch the browser
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Set a user agent to mimic a real browser
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
        );

        // Navigate to the target URL
        const targetUrl = 'https://courses.jhu.edu/?terms=Fall+2024'; // Update with your URL
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Scrape raw text from the entire page
        const rawText = await page.evaluate(() => {
            return document.body.innerText;
        });

        // Get all `<option>` values and labels from the select element
        const options = await page.evaluate(() => {
            const select = document.querySelector('select'); // Modify selector if needed
            return Array.from(select?.options || []).map(option => ({
                value: option.value,
                label: option.textContent.trim()
            }));
        });

        // Initialize scrapedData as an array
        const scrapedData = [];
        scrapedData.push({ 'raw text': rawText });

        // Iterate through each option and scrape the corresponding content
        for (const option of options) {
            console.log(`Selecting option: ${option.value} - ${option.label}`);
            await page.select('select', option.value); // Replace selector if necessary
            await new Promise(resolve => setTimeout(resolve, 3000)); // Adjust this wait time if necessary for content to load

            // Remove inline styles to make hidden content visible
            await page.evaluate(() => {
                document.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
            });

            // Extract content related to the selected option
            const optionContent = await page.evaluate(() => {
                const selectedValue = document.querySelector('select').value;
                const disciplineDiv = document.querySelector(`.StudiesByDiscipline[data-discipline='${selectedValue}']`);
                return disciplineDiv ? disciplineDiv.innerText : 'No content found';
            });

            // Add the option's value, label, and content to the scrapedData array
            scrapedData.push({
                'value': option.value,
                'label': option.label,
                'content': optionContent
            });
        }

        // Save the scraped content to a file
        fs.writeFileSync('scraped_content.json', JSON.stringify(scrapedData, null, 2));
        console.log('Scraping completed! Content saved to scraped_content.json.');

        // Close the browser
        await browser.close();


    } catch (error) {
        console.error('Error:', error);
    }
})();