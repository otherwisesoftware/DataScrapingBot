const fs = require('fs');
const TOP_N = 20;
// Load posts data
const posts = JSON.parse(fs.readFileSync('all_posts.json', 'utf8'));
const companiesData = JSON.parse(fs.readFileSync('unique_output.json', 'utf8'));

const companyHateScores = {};
companiesData.companies.forEach(company => {
    companyHateScores[company.name] = company.hateScore ? parseFloat(company.hateScore) : 0;
});


// Metrics
const totalPosts = posts.length;
const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
const totalCompanies = companiesData.companies.length;  // Calculate total companies

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


    const ANSI_CYAN = "\x1b[36m";
    const ANSI_YELLOW = "\x1b[33m";
    const ANSI_RED = "\x1b[31m";
    const ANSI_RESET = "\x1b[0m";

    // Output metrics
    console.log('Metrics for anti-israel-employees.com:');
    console.log('---------------------------');
    console.log(`Total Companies: ${ANSI_CYAN}${totalCompanies}${ANSI_RESET}`);
    console.log(`Total Posts: ${ANSI_CYAN}${totalPosts}${ANSI_RESET}`);
    console.log(`Total Likes: ${ANSI_CYAN}${totalLikes}${ANSI_RESET}`);
    console.log(`Most Active Company: ${ANSI_CYAN}${sortedCompaniesByActivity[0][0]}${ANSI_RESET} with ${ANSI_CYAN}${sortedCompaniesByActivity[0][1]}${ANSI_RESET} posts.`);
    console.log(`Top ${TOP_N} Companies by Number of Posts:`);
    topCompaniesByActivity.forEach(([company, count], index) => {
        console.log(`#${index + 1}: ${ANSI_CYAN}${company} ${ANSI_RESET} - ${ANSI_CYAN}${count}${ANSI_RESET}  posts.`);
    });

    console.log(`Most Engaging Post by ${ANSI_CYAN}${mostEngagingPost.companyName}${ANSI_RESET} with ${ANSI_CYAN}${mostEngagingPost.likes} likes and ${mostEngagingPost.comments} comments.${ANSI_RESET}`);
    console.log(`${ANSI_RED}Top ${TOP_N} Popular Posts by Company Name:`);
    mostPopularPosts.forEach((post, index) => {
        console.log(`#${index + 1}: ${ANSI_CYAN}${post.companyName}${ANSI_RESET} - ${post.likes} likes, ${post.comments} comments.`);
    });
    console.log(`${ANSI_RED}Top ${TOP_N}  Companies by hateScore:`);
    topCompaniesByHateScore.forEach(([company, score], index) => {
        console.log(`#${index + 1}: ${ANSI_CYAN}${company}${ANSI_RESET} - Hate Score: ${score}`);
    });


    console.log(`${ANSI_RED}Top ${TOP_N}  Employees by Number of Posts Reported:${ANSI_RESET}`);
    topEmployeesByPosts.forEach(([employee, count], index) => {
        console.log(`#${index + 1}: ${ANSI_YELLOW}${employee}${ANSI_RESET} - ${count} posts.`);
    });
