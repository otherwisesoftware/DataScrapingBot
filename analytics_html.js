const fs = require('fs');
const puppeteer = require('puppeteer');
const TOP_N = 20;

// Load posts data
    const posts = JSON.parse(fs.readFileSync('datacollected/all_posts.json', 'utf8'));
    const companiesData = JSON.parse(fs.readFileSync('datacollected/unique_output.json', 'utf8'));

    const companyHateScores = {};
    companiesData.companies.forEach(company => {
        companyHateScores[company.name] = company.hateScore ? parseFloat(company.hateScore) : 0;
    });


    // Metrics
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + parseInt(post.likes, 10), 0);
    const totalCompanies = companiesData.companies.length;

    const companyPostCounts = {};
    posts.forEach(post => {
        companyPostCounts[post.companyName] = (companyPostCounts[post.companyName] || 0) + 1;
    });

    const sortedCompaniesByActivity = Object.entries(companyPostCounts).sort((a, b) => b[1] - a[1]);
    const topCompaniesByActivity = sortedCompaniesByActivity.slice(0, TOP_N);
    const sortedCompanies = Object.entries(companyHateScores).sort((a, b) => {
        const scoreA = a[1] !== null ? a[1] : 0;
        const scoreB = b[1] !== null ? b[1] : 0;
        return scoreB - scoreA;
    });

    const topCompaniesByHateScore = sortedCompanies.slice(0, TOP_N);

    const mostEngagingPost = posts.reduce((prev, current) => {
        return (prev.likes + prev.comments > current.likes + current.comments) ? prev : current;
    }, {});

    const mostPopularPosts = posts.slice().sort((a, b) => {
        const diffLikes = b.likes - a.likes;
        if (diffLikes !== 0) return diffLikes;
        return b.comments - a.comments;
    }).slice(0, TOP_N);

    const employeePostCounts = {};
    posts.forEach(post => {
        employeePostCounts[post.name] = (employeePostCounts[post.name] || 0) + 1;
    });
const topEmployeesByPosts = Object.entries(employeePostCounts).sort((a, b) => b[1] - a[1]).slice(0, TOP_N);

// Section: Total number of unique employees being reported
const uniqueEmployeesSet = new Set();

posts.forEach(post => {
    uniqueEmployeesSet.add(post.name);
});

const totalUniqueEmployees = uniqueEmployeesSet.size;


const now = new Date();

// Extracting day, month, year, and time details
const dayName = now.toLocaleString('en-US', { weekday: 'long' });
const monthName = now.toLocaleString('en-US', { month: 'long' });
const year = now.getFullYear();
const time = now.toLocaleTimeString('en-US', { hour12: false });

// Constructing the formatted date string
const formattedDate = `${dayName}, ${monthName} ${year} ${time}`;

// Metrics and other calculations...

// Start building HTML content
let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .cyan {
            color: brown;
        }
        .yellow {
            color: cadetblue;
        }
        .red {
            color: ;
        }
    </style>
</head>
<body>
    <h1>Metrics for anti-israel-employees.com </h1>
    <p>Last update <span class="cyan">${formattedDate}</span></p>
    <hr>
    <p>Total Reported Companies: <span class="cyan">${totalCompanies}</span></p>
    <p>Total Reported Employees: <span class="cyan">${totalUniqueEmployees}</span></p>
    <p>Total Reported Posts: <span class="cyan">${totalPosts}</span></p>
    <p>Total Reported Posts Likes: <span class="cyan">${totalLikes}</span></p>

    <h2>Top ${TOP_N} Reported Companies by Number of Posts:</h2>
    <ul>`;

    topCompaniesByActivity.forEach(([company, count], index) => {
        htmlContent += `<li><strong>#${index + 1}:</strong> <span class="cyan">${company}</span> - <span class="cyan">${count}</span> posts.</li>`;
    });
    htmlContent += `
    <h2>Most Engaging Reported Post By Company:</h2>
    <p>Posted by <span class="cyan">${mostEngagingPost.companyName}</span> with <span class="cyan">${mostEngagingPost.likes}</span> likes and <span class="cyan">${mostEngagingPost.comments}</span> comments.</p>
    <hr>
    `;
    htmlContent += `
    <h2>Top ${TOP_N} Popular Reported Posts by Company Name:</h2>
    <ul>
    `;
    mostPopularPosts.forEach((post, index) => {
        htmlContent += `<li><strong>#${index + 1}:</strong> <span class="cyan">${post.companyName}</span> - ${post.likes} likes, ${post.comments} comments.</li>`;
    });
    htmlContent += `</ul><hr>`;

    htmlContent += `
    <h2 class="red">Top ${TOP_N} Reported Companies by Hate Score:</h2>
    <ul>
    `;
    topCompaniesByHateScore.forEach(([company, score], index) => {
        htmlContent += `<li><strong>#${index + 1}:</strong> <span class="cyan">${company}</span> - Hate Score: ${score}</li>`;
    });
    htmlContent += `</ul><hr>`;

    htmlContent += `
    <h2 class="red">Top ${TOP_N} Reported Employees by Number of Posts Reported:</h2>
    <ul>
    `;
    topEmployeesByPosts.forEach(([employee, count], index) => {
        //const anonymizedEmployee = employee.replace(/^(\w+)\s+(\w+\.?),/, '**** ****,');
        const anonymizedEmployee = employee.replace(/^(\p{L}+)[\s.]+(\p{L}+)[^,]*,/u, '**** ****,');
        htmlContent += `<li><strong>#${index + 1}:</strong> <span class="yellow">${anonymizedEmployee}</span> - ${count} posts.</li>`;
    });
    htmlContent += `</ul><hr>`;


    const companiesAboveThreshold = Object.entries(companyPostCounts).filter(([_, count]) => count > TOP_N);
    htmlContent += `
    <h2>Reported Companies with More than ${TOP_N} Posts:</h2>
    <p>Total: <span class="cyan">${companiesAboveThreshold.length}</span></p>
    <ul>
    `;
    companiesAboveThreshold.forEach(([company, count]) => {
        htmlContent += `<li><span class="cyan">${company}</span> - ${count} posts</li>`;
    });
    htmlContent += `</ul><hr>`;

    const postDateCounts = {};
    posts.forEach(post => {
        postDateCounts[post.date] = (postDateCounts[post.date] || 0) + 1;
    });

/*    htmlContent += `
    <h2>Distribution of Posts Over Time:</h2>
    <ul>
    `;
    Object.entries(postDateCounts).sort().forEach(([date, count]) => {
        htmlContent += `<li><span class="cyan">${date}</span>: ${count} posts</li>`;
    });
    htmlContent += `</ul><hr>`;*/


    const topCommentedPosts = posts.slice().sort((a, b) => b.comments - a.comments).slice(0, 10);
    htmlContent += `
    <h2>Top 10 Reported Posts with Most Comments Per Company Name:</h2>
    <ul>
    `;
    topCommentedPosts.forEach((post, index) => {
        htmlContent += `<li><strong>#${index + 1}:</strong> From <span class="cyan">${post.companyName}</span> with <span class="cyan">${post.comments}</span> comments.</li>`;
    });
    htmlContent += `</ul><hr>`;

    const companiesWithoutPosts = companiesData.companies.filter(company => !companyPostCounts[company.name]);
    htmlContent += `
    <h2>Reported Companies Without Any Posts:</h2>
    <p>Total: <span class="cyan">${companiesWithoutPosts.length}</span></p>
    <ul>
    `;
    companiesWithoutPosts.forEach(company => {
        htmlContent += `<li><span class="cyan">${company.name}</span></li>`;
    });
    htmlContent += `</ul><hr>`;







    htmlContent += '<h2>All Companies and Their Reported Posts</h2>';
    htmlContent += '<ul>';

    const companyToEmployeesMap = {};

    posts.forEach(post => {
        if (!companyToEmployeesMap[post.companyName]) {
            companyToEmployeesMap[post.companyName] = new Set();
        }
        companyToEmployeesMap[post.companyName].add(post.name);
    });

    // Sort companies by post count
    const sortedCompanyEntries = Object.entries(companyPostCounts).sort((a, b) => b[1] - a[1]);

    sortedCompanyEntries.forEach(([companyName, postCount]) => {
        const numberOfEmployees = companyToEmployeesMap[companyName] ? companyToEmployeesMap[companyName].size : 0;
        htmlContent += `<li><span class="cyan">${companyName}</span>: <span class="yellow">${postCount}</span> posts from <span class="yellow">${numberOfEmployees}</span> employees.</li>`;
    });

    htmlContent += '</ul>';


    htmlContent += `
        </ul>
    </body>
    </html>
    `;

// Save the generated HTML to a file
const dateTimeString = getFormattedDateTime();

// Save the generated HTML to a file with the date and time
fs.writeFileSync(`finalreports/analytics_report_${dateTimeString}.html`, htmlContent);

(async () => {
    const pdfBuffer = await generatePDF(htmlContent);
    fs.writeFileSync(`finalreports/analyticsReport_${dateTimeString}.pdf`, pdfBuffer);
})();

async function generatePDF(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: 'networkidle0' // ensures that all content is loaded
    });

    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    await browser.close();
    return pdf;
}

function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}