const fs = require('fs');
const csv = require('csv-parse/sync');
const path = require('path');
const chokidar = require('chokidar');

// Get the project root directory
const projectRoot = path.join(__dirname, '..');

function generateHtml() {
    try {
        // Read the template file
        const template = fs.readFileSync(path.join(projectRoot, 'src/template.html'), 'utf-8');

        // Read and parse the CSV file
        const csvData = fs.readFileSync(path.join(projectRoot, 'src/data.csv'), 'utf-8');
        const records = csv.parse(csvData, {
            columns: true,
            skip_empty_lines: true
        });

        // Get headers from CSV
        const headers = Object.keys(records[0]);

        // Generate table headers HTML
        const tableHeaders = headers.map(header => `<th>${header}</th>`).join('');

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
                ${headers.map(header => 
                    header.toLowerCase() === 'status' 
                        ? `<td><span class="${getStatusClass(record[header])}">${record[header]}</span></td>`
                        : `<td>${record[header]}</td>`
                ).join('')}
            </tr>
        `).join('');

        // Replace placeholders in template
        let finalHtml = template.replace('{{TABLE_HEADERS}}', tableHeaders);
        finalHtml = finalHtml.replace('{{TABLE_ROWS}}', tableRows);

        // Create dist directory if it doesn't exist
        const distDir = path.join(projectRoot, 'dist');
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir);
        }

        // Write the final HTML file
        fs.writeFileSync(path.join(distDir, 'index.html'), finalHtml);

        console.log('index.html generated successfully in dist folder!');
    } catch (error) {
        console.error('Error generating HTML:', error);
    }
}

// Watch mode function
function watchFiles() {
    const watcher = chokidar.watch([
        path.join(projectRoot, 'src/template.html'),
        path.join(projectRoot, 'src/data.csv')
    ], {
        persistent: true
    });

    watcher
        .on('ready', () => {
            console.log('Initial scan complete. Watching for changes...');
            generateHtml(); // Generate on start
        })
        .on('change', (filepath) => {
            console.log(`File ${filepath} has been changed`);
            generateHtml();
        });
}

// If running in watch mode
if (process.argv.includes('--watch')) {
    watchFiles();
} else {
    generateHtml();
}
