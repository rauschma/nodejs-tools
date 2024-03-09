import EventEmitter from 'node:events';

type OnExitData = {
  code: number | null;
  signal: NodeJS.Signals | null;
};
export function onExit(eventEmitter: EventEmitter): Promise<OnExitData> {
  return new Promise((resolve, reject) => {
    eventEmitter.once('exit',
      (exitCode, signalCode) => {
        if (exitCode === 0) {
          resolve({code: exitCode, signal: signalCode});
        } else {
          reject(new Error(`Non-zero exit: code ${exitCode}, signal ${signalCode}`));
        }
      }
    );
    eventEmitter.once('error', (err) => {
      reject(err);
    });
  });
}
