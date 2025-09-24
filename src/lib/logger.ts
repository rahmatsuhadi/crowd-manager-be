import pino from 'pino';

const pinoPrettyConfig = {
  target: 'pino-pretty',
  options: {
    colorize: true, 
    translateTime: 'SYS:dd-mm-yyyy HH:MM:ss', 
    ignore: 'pid,hostname', 
  },
};

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? pinoPrettyConfig : undefined,
});

export default logger;