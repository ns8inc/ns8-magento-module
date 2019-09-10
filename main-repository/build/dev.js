const fs = require('fs')

const placeConfig = () => {
  fs.copyFileSync('build/etc/integration/config.dev.xml', 'src/etc/integration/config.xml')
  fs.copyFileSync('build/etc/integration/api.dev.xml', 'src/etc/integration/api.xml')
}

placeConfig()