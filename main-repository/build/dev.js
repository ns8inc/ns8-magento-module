const fs = require('fs')

const placeConfig = () => {
  fs.copyFileSync('build/etc/integration/config.dev.xml', 'src/etc/integration/config.xml')
}

placeConfig()