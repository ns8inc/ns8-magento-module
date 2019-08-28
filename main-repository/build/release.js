const fs = require('fs')

const placeConfig = (mode) => {
  fs.copyFileSync('build/etc/integration/config.prod.xml','src/etc/integration/config.xml')
}

placeConfig()