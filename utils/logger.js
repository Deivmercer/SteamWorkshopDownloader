const winston = require('winston');

module.exports = {

    log: winston.createLogger({
            level: process.env.LOGGER_LEVEL,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(msg => {
                    return `${msg.timestamp} - ${msg.level}: ${msg.message}`
                })),
            transports: [
                new winston.transports.File({ filename: __dirname + "/steamworkshopdownloader.log" }),
                new winston.transports.Console()
            ]
        })
}