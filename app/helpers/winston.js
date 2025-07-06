const winston = require('winston');

const Logger = winston .createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
    ],
});

module.exports = Logger;