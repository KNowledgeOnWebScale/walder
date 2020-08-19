const winston = require('winston');

/**
 * This method creates a winston logger.
 * @param level The output level of the logger.
 */
function createLogger(level) {
  const myFormat = winston.format.printf(({level, message, timestamp}) => {
    return `${level} ${timestamp} : ${message}`;
  });

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.errors({stack: true}),
      winston.format.splat(),
      winston.format.timestamp(),
      myFormat
    ),
    exitOnError: false, // do not exit on handled exceptions
  });

  // Log to the `console` with the colorized simple format.
  logger.add(new winston.transports.Console({
    level,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.timestamp(),
      myFormat
    ),
    timestamp: true
  }));

  if (!level) {
    // Turn off logging
    logger.transports[0].silent = true;
  }

  return logger;
}

module.exports = createLogger;
