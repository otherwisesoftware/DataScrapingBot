const { execSync } = require('child_process');

const scripts = ['companies.js', 'removeDuplicates.js', 'employees.js', 'analytics_html.js' ];

scripts.forEach(script => {
    console.log(`Executing ${script}...`);
    execSync(`node ${script}`, { stdio: 'inherit' });
    console.log(`${script} executed successfully.`);
});

console.log('All scripts executed successfully.');
