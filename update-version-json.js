const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const version = packageJson.version;
const versionData = {
  version: version
};

const targetPath = path.join(__dirname, 'src', 'assets', 'version.json');
fs.writeFileSync(targetPath, JSON.stringify(versionData, null, 2));
console.log(`✔ version.json actualizado con versión: ${version}`);
