const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = 'DSL-Code-Example.forgeapi';

// Check if the file extension is .forgeapi
if (path.extname(filePath) === '.forgeapi') {
    // Read the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        console.log('Content of the DSL:', data);
        // Further processing e.g parsing
    });
} else {
    console.error('Wrong file extension. Please provide a .forgeapi file.');
}
