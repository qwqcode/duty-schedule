import camelCase from 'lodash/camelCase'

const files = require.context('.', false, /\.vue$/)
const modules: any = {}

files.keys().forEach((fileName) => {
  if (fileName === './index.ts') { return }
  const moduleName = camelCase(
    fileName.replace(/(\.\/|\.vue)/g,'')
  )
  modules[`${moduleName}Service`] = files(fileName).default
})

export default modules
