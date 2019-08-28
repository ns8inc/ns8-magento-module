const fs = require('fs')

const placeConfig = (mode) => {
  const configXml = fs.readFileSync('build/etc/integration/config.prod.xml', 'utf-8')
  fs.writeFileSync('src/etc/integration/config.xml', configXml)
}

placeConfig()