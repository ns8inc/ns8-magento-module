const fs = require('fs')

const placeConfig = (mode) => {
  fs.copyFileSync('build/etc/integration/config.prod.xml', 'src/etc/integration/config.xml')
  fs.copyFileSync('build/etc/integration/api.prod.xml', 'src/etc/integration/api.xml')
}

placeConfig()