const fs = require('fs');
const csv = require('csv-parse/sync');
const path = require('path');
const chokidar = require('chokidar');

function generateHtml() {
    try {
        // Read the template file
        const template = fs.readFileSync(path.join(__dirname, '../src/template.html'), 'utf-8');

        // Read and parse the CSV file
        const csvData = fs.readFileSync(path.join(__dirname, '../src/data.csv'), 'utf-8');
        const records = csv.parse(csvData, {
            columns: true,
            skip_empty_lines: true
        });

        // Helper function to get status class
        const getStatusClass = (status) => {
            switch(status.toLowerCase()) {
                case 'completed':
                    return 'status-completed';
                case 'pending':
                    return 'status-pending';
                case 'in progress':
                    return 'status-progress';
                default:
                    return '';
            }
        };

        // Generate table rows HTML
        const tableRows = records.map(record => `
            <tr>
                <td>${record['Job title']}</td>
                <td><span class="${getStatusClass(record['Status'])}">${record['Status']}</span></td>
                <td>${record['Assigned Volunteers']}</td>
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

        // Write the final HTML file
        fs.writeFileSync(path.join(__dirname, '../dist/index.html'), finalHtml);

        console.log('index.html generated successfully in dist folder!');
    } catch (error) {
        console.error('Error generating HTML:', error);
    }
}

// Watch mode function
function watchFiles() {
    const watcher = chokidar.watch([
        path.join(__dirname, '../src/template.html'),
        path.join(__dirname, '../src/data.csv')
    ], {
        persistent: true
    });

    watcher
        .on('ready', () => {
            console.log('Initial scan complete. Watching for changes...');
            generateHtml(); // Generate on start
        })
        .on('change', (path) => {
            console.log(`File ${path} has been changed`);
            generateHtml();
        });
}

// If running in watch mode
if (process.argv.includes('--watch')) {
    watchFiles();
} else {
    generateHtml();
}
