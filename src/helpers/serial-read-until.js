import { DelimiterParser } from '@serialport/parser-delimiter';
import { RegexParser } from '@serialport/parser-regex'
import delay from 'delay';

export function serialReadUntil(port, end, timeout=0) {
  return new Promise((resolve, reject) => {
    let parser;
    if (end instanceof RegExp) {
      parser = port.pipe(new RegexParser({ regex: end }));
    } else {
      parser = port.pipe(new DelimiterParser({ delimiter: end }));
    }

    let timeoutAbortController = null;
    if (timeout && timeout > 0) {
      timeoutAbortController = new AbortController();
      delay(timeout, { signal: timeoutAbortController.signal }).then(() => {
        port.unpipe(parser);
        reject('Timeout');
      }, () => {});
    }
    
    parser.on('data', data => {
      if (timeoutAbortController) {
        timeoutAbortController.abort();
      }
      port.unpipe(parser);
      resolve(data.toString());
    });
  });
}
