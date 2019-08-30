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
      transports: [
        // - Write to all logs with level `info` and below to `walter/combined.log`
        // - Write all logs error (and below) to `walter/error.log`.
        new winston.transports.File({
          filename: Path.resolve(__dirname, '../error.log'),
          level: 'error',
          name: 'file.error'
        }),
        new winston.transports.File({filename: Path.resolve(__dirname, '../combined.log'), name: 'file.combined'})
      ],
      exitOnError: false, // do not exit on handled exceptions
    });

    // If we're not in production then **ALSO** log to the `console` with the colorized simple format.
    if (this.level) {
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
    }

    // Turn off file writing
    logger.transports[0].silent = true;
    logger.transports[1].silent = true;

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
