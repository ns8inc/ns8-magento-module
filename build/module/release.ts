import { existsSync, mkdirSync, createWriteStream } from 'fs';
var archiver = require('archiver');

if (!existsSync('release')) mkdirSync('release');

const output = createWriteStream('release/NS8_Protect.zip');
const archive = archiver('zip');

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);
archive.glob('**/**', {
  cwd: 'module',
  ignore: ['**/vendor/**']
});
archive.finalize();
