const fetch = require('node-fetch');
const fs = require('fs');
const BASE_URL = "https://anti-israel-detector-backend.onrender.com/api/get-data";
const FILE_PATH = "datacollected/companies.json";
async function fetchPageData(pageNumber, retry = false) {
    try {
        const finalUrl =  `${BASE_URL}?from=${pageNumber}&reCaptchaToken=${generateToken()}`;
        console.log(`fetching data for url ${finalUrl}`);
        const response = await fetch(`${finalUrl}`);
        console.log(`fetching data for page ${pageNumber}.`);
        if (response.ok) {
            console.log(`Sucess fetching data for page ${pageNumber}.`);
            const data = await response.json();
            appendToFile(data);
        } else {
            console.error(`\x1b[31mError fetching data for page ${pageNumber}. Status: ${response.status}\x1b[0m`);
        }
    } catch (error) {
        console.error(`\x1b[31mError fetching data for page ${pageNumber}.\x1b[0m`, error);
        if (!retry) {
            console.log('\x1b[33mRetrying...\x1b[0m');
            await fetchPageData(pageNumber, true);
        }
    }
}


function appendToFile(data) {


    const currentData = fs.existsSync(FILE_PATH) ? JSON.parse(fs.readFileSync(FILE_PATH, 'utf8')) : [];
    currentData.push(data);
    fs.writeFileSync(FILE_PATH, JSON.stringify(currentData, null, 2));
}

async function main() {
    backupFile();
    resetFile();
    for (let page = 1; page <= 300; page++) {
        await fetchPageData(page);
        await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for 5 seconds
    }
}
function resetFile() {
    fs.writeFileSync(FILE_PATH, '[]', 'utf8');  // Reset the file with an empty array
    console.log(`Reset done for: ${FILE_PATH}`);
}
function backupFile() {
    const currentDateTime = new Date().toISOString().replace(/[:\-T]/g, "").slice(0, 14); // YYYYMMDDHHMMSS format
    const backupFilePath = FILE_PATH + `_backup_${currentDateTime}.json`;

    if (fs.existsSync(FILE_PATH)) {
        fs.copyFileSync(FILE_PATH, backupFilePath);
        console.log(`Backup created: ${backupFilePath}`);
    }
}
function generateToken(length = 1593) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
}

main();
