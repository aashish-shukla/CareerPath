export const logger = {
  info: (msg, meta) => {
    // eslint-disable-next-line no-console
    console.log(`[info] ${msg}`, meta ?? "");
  },
  warn: (msg, meta) => {
    // eslint-disable-next-line no-console
    console.warn(`[warn] ${msg}`, meta ?? "");
  },
  error: (msg, meta) => {
    // eslint-disable-next-line no-console
    console.error(`[error] ${msg}`, meta ?? "");
  },
};

