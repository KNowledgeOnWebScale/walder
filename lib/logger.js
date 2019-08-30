const winston = require('winston');
const Path = require('path');

/**
 * Logger singleton class.
 *
 * Reusable winston logger.
 */
class Logger {
  constructor(level) {
    this.level = level;
    if (!Logger.instance) {
      this.createLogger();
    }

    return Logger.instance;
  }

  createLogger() {
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
      level: this.level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp(),
        myFormat
      ),
      timestamp: true
    }));

    if (!this.level) {
      // Turn off logging
      logger.transports[0].silent = true;
    }

    Logger.instance = logger;
  }
}

/**
 * Creates/returns a winston logger (singleton).
 *
 * @param level
 * @returns {Logger}
 */
module.exports = (level) => {
  const instance = new Logger(level);
  Object.freeze(instance);
  return instance;
};
