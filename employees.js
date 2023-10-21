const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://www.anti-israel-employees.com'; // Replace with the base part of your URL
const ANSI_CYAN = "\x1b[36m";
const ANSI_YELLOW = "\x1b[33m";
const ANSI_RED = "\x1b[31m";
const ANSI_RESET = "\x1b[0m";
let companies = [];
const POSTS_FILE = "datacollected/all_posts.json"
try {
    // Load company data from unique_output.json
    companies = JSON.parse(fs.readFileSync('datacollected/unique_output.json', 'utf8')).companies;
} catch (error) {
    console.error('Error reading or parsing unique_output.json:', error.message);
    return; // Exit if there's an error reading/parsing the file
}

// Function to fetch and process data for a given companyId
const fetchDataForCompanyOld = async (company) => {
    const URL = `${BASE_URL}/${company.companyId}`;
    console.log(URL)
    try {
        const response = await axios.get(URL);
        const html = response.data;
        const $ = cheerio.load(html);
        const posts = [];

        $("div[class^='company-posts_container__']").each((_, container) => {
            $(container).find("div[class^='post_gridContainer__']").each((_, postContainer) => {
                const post = {};
                post.companyId = company.companyId;
                post.companyName = company.name; // Add companyName to each post object
                post.profile = $(postContainer).find("div[class^='post_mobileGridHeader__']:contains('Profile')").next().text();
                post.name = $(postContainer).find("div[class^='post_mobileGridHeader__']:contains('Name:')").next().text();
                post.published = $(postContainer).find("div[class^='post_mobileGridHeader__']:contains('Published')").next().text();
                post.content = $(postContainer).find("div[class^='post_mobileGridHeader__']:contains('Content:')").next().text();
                post.likes = parseInt($(postContainer).find("div[class^='post_mobileGridHeader__']:contains('Likes:')").next().text().trim());
                post.comments = parseInt($(postContainer).find("div[class^='post_mobileGridHeader__']:contains('Comments:')").next().text().trim());
                post.link = $(postContainer).find("div[class^='post_mobileGridHeader__']:contains('Link:')").next().find('a').attr('href');
                post.avatarLink = $(postContainer).find("a[class^='post_avatarContainer__']").attr('href');
                posts.push(post);
            });
        });

        return posts;

    } catch (error) {
        console.error("Error fetching the URL for company:", company.name, "-", company.companyId, error);
        return [];
    }
}

const fetchDataForCompany = async (company) => {
    const encodedCompanyId = encodeURIComponent(company.companyId);
    const URL = `${BASE_URL}/${encodedCompanyId}`;
    console.log(URL);
    try {
        const response = await axios.get(URL);
        const html = response.data;
        const $ = cheerio.load(html);
        const results = [];

        const postContainers = $('.flex.flex-col.lg\\:items-center.lg\\:flex-row.lg\\:justify-between.gap-2.border-1.p-4.text-xs.font-medium.border-gray-50.bg-white.rounded-2xl');
        postContainers.each((_, container) => {
            const profileImg = $(container).find('img[alt="Profile Image"]').attr('src');
            const name = $(container).find('a.text-linkBlue').text();
            const profile = $(container).find('a.text-linkBlue').attr('href');
            const published = $(container).find('.self-end.lg\\:self-center.lg\\:w-full.lg\\:max-w-\\[160px\\]').text();
            const content = $(container).find('.border-y.border-gray-300.py-2.mt-1.lg\\:mt-0.lg\\:py-0.lg\\:border-y-0.lg\\:w-full.lg\\:max-w-\\[400px\\] p').text();
            const stats = $(container).find('.flex.flex-row.items-center.gap-2');
            const likes = $(stats[0]).text().trim();
            const comments = $(stats[1]).text().trim();
            const companyId = company.companyId;
            const companyName = company.name; // Add companyName to each post object

            results.push({
                companyId,
                companyName,
                profileImg,
                name,
                profile,
                published,
                content,
                likes,
                comments
            });
        });
        console.log(`${ANSI_CYAN} Total Post Retrieved: ${results.length}${ANSI_RESET}`);
        return results;

    } catch (error) {
        console.error("Error fetching the URL for company:", company.name, "-", company.companyId, error);
        return [];
    }
}



const main = async () => {
    const totalCompanies = companies.length;

    if (fs.existsSync(POSTS_FILE)) {
        const currentDate = new Date();
        const backupFilename = POSTS_FILE + `_backup_${currentDate.toISOString().replace(/:/g, '-')}.json`;
        fs.copyFileSync(POSTS_FILE, backupFilename);
        console.log(`Backup created: ${backupFilename}`);
    }

    fs.writeFileSync(POSTS_FILE, '[]');

    for (let i = 0; i < totalCompanies; i++) {
        const company = companies[i];

        console.log(`Processing company ${company.name} (${company.companyId}) (${i + 1}/${totalCompanies})...`);

        const posts = await fetchDataForCompany(company);
        console.log(`Finished processing company ${company.name}. Retrieved ${posts.length} posts.`);

        let existingPosts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));

        // Append the new posts
        existingPosts.push(...posts);

        fs.writeFileSync(POSTS_FILE, JSON.stringify(existingPosts, null, 2));

        if (i < totalCompanies - 1) {
            console.log(`Waiting for 5 seconds before processing the next company...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        }
    }

    console.log(`All done! Extracted data saved to `+ POSTS_FILE);
}


main();
