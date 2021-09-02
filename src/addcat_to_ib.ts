import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { stat } from 'fs/promises'
import { join, parse, resolve } from "path"

;(async() => {
  const args = process.argv.slice(2)
  const dargs: any = {}

  for(let i = 0; i < args.length; i++) {
    const arg = args[i]

    const g = arg.split('=')
    const n = g[0].replace('--', "")
    const v = g[1]

    if(n === 'path') {
      const s = await stat(v)

      if(!s.isDirectory()) {
        let p = parse(v)
        
        dargs['path'] = p.dir
        dargs['file'] = p.base
      } else {
        dargs['path'] = v
      }
    } else if(n === 'file') {
      if(dargs['file'] === undefined) dargs[n] = v
    } else if(n === 'type') {
      if(v.match(/\items?/g)) {
        dargs['type'] = 'item'
      }
      if(v.match(/\Blocks?/g)) {
        dargs['type'] = 'block'
      }
    } else {
      dargs[n] = v
    }
  }

  if(Object.getOwnPropertyNames(dargs).includes('help')) {
    console.log('Add Category to Items and Blocks Help:')
    console.log('  --path (optional) file(s) directory or file path')
    console.log('  --type (optional) values: item | block - not needed since it will auto detect which one is')
    console.log('  --cat (optional) category name')
    console.log('  --file (optional)')
    return
  }

  interface IDefs {
    path: string,
    type: 'item' | 'block'
    category: string,
    file?: string
  }

  const defs: IDefs = {
    path: dargs.path ?? __dirname,
    type: dargs.type ?? 'item',
    category: dargs.category ?? 'Construction',
    file: dargs.file
  }

  readdirSync(resolve(defs.path)).forEach(file => {
    if(file.endsWith('.json') && (defs.file === undefined || (defs.file && defs.file === file) )) {
      const data = JSON.parse(readFileSync(join(defs.path, file)).toString('utf-8'))
     
      if(data['minecraft:item']) {
        data['minecraft:item'].description = {...data['minecraft:item'].description, category: defs.category }
      }
  
      if(data['minecraft:block']) {
        if(data['minecraft:block'].components['minecraft:creative_category']) {
          data['minecraft:block'].components['minecraft:creative_category'] = { ...data['minecraft:block'].components['minecraft:creative_category'], category: defs.category }
        } else {
          data['minecraft:block'].components['minecraft:creative_category'] = { category: defs.category }
        }
      }
  
      writeFileSync(join(defs.path, file), JSON.stringify(data, null, 2))
    }
  })
})()