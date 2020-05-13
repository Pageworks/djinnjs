const ghPages = require("gh-pages");
require("dotenv").config();

ghPages.publish(
    "public",
    {
        user: {
            name: process.env.NAME,
            email: process.env.EMAIL,
        },
        repo: "https://" + process.env.ACCESS_TOKEN + "@github.com/" + process.env.USERNAME + "/" + process.env.PROJECT + ".git",
        silent: true,
    },
    error => {
        if (error) {
            console.log(error);
        }
    }
);
