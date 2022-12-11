const axios = require('axios');
const cheerio = require("cheerio");

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

async function fetch({ url, selector }) {
    console.log('start', url)

    try {
        const start = process.hrtime();
        const resp = await axios.get(url, {
            headers: {
                "Accept-Language": "en-US,en;q=0.9,pl;q=0.8",
                "Accept-Encoding": "gzip,deflate"
            }
        });
        let $ = cheerio.load(resp.data);

        if (selector.startsWith('noscript')) {
            $ = cheerio.load($('noscript').first().html())
            selector = selector.replace('noscript', '').trim()
        }

        const value = ($(selector).first().text() || '').trim();

        const durationInMilliseconds = getDurationInMilliseconds(start)
        console.log("fetch", `${durationInMilliseconds}ms`, value, url, selector);

        return value;
    } catch (err) {
        console.log(err);
    }
}

module.exports = fetch;
