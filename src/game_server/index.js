const server = require('./server');

(async function () {
  server().catch(x => {
    /* eslint-disable no-process-exit */
    console.error(x.stack);
    process.exit(1);
  });
})()