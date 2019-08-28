const winston = require('winston');
const Path = require('path');

/**
 * Creates and returns a winston logger.
 *
 * @param level, minimum level to log
 * @returns {Logger}
 */
module.exports = (level) => {
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
    transports: [
      // - Write to all logs with level `info` and below to `walter/combined.log`
      // - Write all logs error (and below) to `walter/error.log`.
      // todo: file writing doesn't work yet for some reason
      new winston.transports.File({filename: Path.resolve(__dirname, '../error.log'), level: 'error'}),
      new winston.transports.File({filename: Path.resolve(__dirname, '../combined.log')})
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

// If we're not in production then **ALSO** log to the `console` with the colorized simple format.
  if (level) {
    logger.add(new winston.transports.Console({
      level: level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp(),
        myFormat
      ),
      timestamp: true
    }));
  }


  return logger;
};
