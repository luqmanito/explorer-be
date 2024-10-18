import * as winston from "winston";

const { combine, timestamp, printf, colorize, align } = winston.format;

export const logger = winston.createLogger({
  level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});