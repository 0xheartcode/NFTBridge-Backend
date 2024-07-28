export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function overrideConsoleMethods() {
  function getFormattedTimestamp() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
    return `${date} ${time}`;
  }

  const originalConsoleError = console.error;
  console.error = function(...args) {
    originalConsoleError(`[${getFormattedTimestamp()}]`, ...args);
  };

  const originalConsoleLog = console.log;
  console.log = function(...args) {
    originalConsoleLog(`[${getFormattedTimestamp()}]`, ...args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    originalConsoleWarn(`[${getFormattedTimestamp()}]`, ...args);
  };
}

export function logError(error: unknown, context: string): void {
  if (error instanceof Error) {
    console.error(`${context}: ${error.message}`);
  } else {
    console.error(`${context}: Unknown error: ${JSON.stringify(error)}`);
  }
}

export function rpcLogError(error: unknown, context: string): void {
  if (error instanceof Error) {
    console.error(`${context}: ${error.message}`);
  } else if (typeof error === 'object' && error !== null) {
    const anyError = error as CustomError;
    console.error(`${context}: Unknown error: ${JSON.stringify(error)}`);
    if (anyError.code) console.error(`Code: ${anyError.code}`);
    if (anyError.info?.error?.message) console.error(`Message: ${anyError.info.error.message}`);
    if (anyError.shortMessage) console.error(`Short Message: ${anyError.shortMessage}`);
  } else {
    console.error(`${context}: Unknown error: ${String(error)}`);
  }
}

interface CustomError {
  code?: string;
  info?: {
    error?: {
      message?: string;
    };
  };
  shortMessage?: string;
}

