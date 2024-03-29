const { exec } = require('child_process');

module.exports = module => new Promise((resolve, reject) => {
  exec(`npm i ${module}`, (error, stdout, stderr) => {
    if (error) {
      console.log('=====NEW DEPENDENCY INSTALL FAILED HORRIBLY=====');
      reject(error);
    }
    else {
      console.log('=====INSTALLED NEW DEPENDENCY=====');
      console.log(stdout);
      console.error(stderr);
      resolve();
    }
  });
});