const fs = require('fs');
const rimraf = require('rimraf');

if (fs.existsSync('./dist')) {
    rimraf('./dist', error => {
        if (error) {
            console.log(error);
        }
    });
}
