const fs = require('fs');
const csv = require('csv-parse/sync');
const path = require('path');

// Read the template file
const template = fs.readFileSync(path.join(__dirname, '../src/template.html'), 'utf-8');

// Read and parse the CSV file
const csvData = fs.readFileSync(path.join(__dirname, '../src/data.csv'), 'utf-8');
const records = csv.parse(csvData, {
    columns: true,
    skip_empty_lines: true
});

// Generate table rows HTML
const tableRows = records.map(record => `
    <tr>
        <td>${record['Job Title']}</td>
        <td>${record['Status']}</td>
        <td>${record['Assigned Volunteer']}</td>
        <td>${record['Deadline Date']}</td>
        <td>${record['Completed Date']}</td>
    </tr>
`).join('');

// Replace placeholder in template with generated rows
const finalHtml = template.replace('{{TABLE_ROWS}}', tableRows);

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '../dist'))) {
    fs.mkdirSync(path.join(__dirname, '../dist'));
}

// Write the final HTML file as index.html
fs.writeFileSync(path.join(__dirname, '../dist/index.html'), finalHtml);

console.log('index.html generated successfully in dist folder!');
