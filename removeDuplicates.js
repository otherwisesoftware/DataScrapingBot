const fs = require('fs');

// Read the data from output.json
const rawData = fs.readFileSync('datacollected/companies.json');
const data = JSON.parse(rawData);

// Flatten the nested arrays of companies
const companies = [].concat(...data.map(item => item.companies));

// Filter unique companies by _id
const uniqueMap = {};
companies.forEach(company => {
    uniqueMap[company._id] = company;
});
const uniqueCompanies = Object.values(uniqueMap);

// Filter companies with valid hateScores and find the highest hateScore
const validHateScores = uniqueCompanies
    .map(company => company.hateScore)
    .filter(score => typeof score === 'number' && !isNaN(score));

const highestHateScore = Math.max(...validHateScores);

// Find the company name associated with the highest hateScore
const companyWithHighestHateScore = uniqueCompanies.find(company => company.hateScore === highestHateScore);

// Print results
console.log("Total unique companies:", uniqueCompanies.length);
console.log("Highest hateScore:", highestHateScore, "by company:", companyWithHighestHateScore.name);

// Write unique companies to a new file (optional)
fs.writeFileSync('datacollected/unique_output.json', JSON.stringify({ companies: uniqueCompanies }, null, 2));
