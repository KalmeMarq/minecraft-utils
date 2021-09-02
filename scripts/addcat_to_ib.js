"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
(async () => {
    const args = process.argv.slice(2);
    const dargs = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const g = arg.split('=');
        const n = g[0].replace('--', "");
        const v = g[1];
        if (n === 'path') {
            const s = await promises_1.stat(v);
            if (!s.isDirectory()) {
                let p = path_1.parse(v);
                dargs['path'] = p.dir;
                dargs['file'] = p.base;
            }
            else {
                dargs['path'] = v;
            }
        }
        else if (n === 'file') {
            if (dargs['file'] === undefined)
                dargs[n] = v;
        }
        else if (n === 'type') {
            if (v.match(/\items?/g)) {
                dargs['type'] = 'item';
            }
            if (v.match(/\Blocks?/g)) {
                dargs['type'] = 'block';
            }
        }
        else {
            dargs[n] = v;
        }
    }
    if (Object.getOwnPropertyNames(dargs).includes('help')) {
        console.log('Add Category to Items and Blocks Help:');
        console.log('  --path (optional) file(s) directory or file path');
        console.log('  --type (optional) values: item | block - not needed since it will auto detect which one is');
        console.log('  --cat (optional) category name');
        console.log('  --file (optional)');
        return;
    }
    const defs = {
        path: dargs.path ?? __dirname,
        type: dargs.type ?? 'item',
        category: dargs.category ?? 'Construction',
        file: dargs.file
    };
    fs_1.readdirSync(path_1.resolve(defs.path)).forEach(file => {
        if (file.endsWith('.json') && (defs.file === undefined || (defs.file && defs.file === file))) {
            const data = JSON.parse(fs_1.readFileSync(path_1.join(defs.path, file)).toString('utf-8'));
            if (data['minecraft:item']) {
                data['minecraft:item'].description = { ...data['minecraft:item'].description, category: defs.category };
            }
            if (data['minecraft:block']) {
                if (data['minecraft:block'].components['minecraft:creative_category']) {
                    data['minecraft:block'].components['minecraft:creative_category'] = { ...data['minecraft:block'].components['minecraft:creative_category'], category: defs.category };
                }
                else {
                    data['minecraft:block'].components['minecraft:creative_category'] = { category: defs.category };
                }
            }
            fs_1.writeFileSync(path_1.join(defs.path, file), JSON.stringify(data, null, 2));
        }
    });
})();
