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
        else {
            dargs[n] = v;
        }
    }
    if (Object.getOwnPropertyNames(dargs).includes('help')) {
        console.log('Encode and Decode JSON Help:');
        console.log('  --path (optional)');
        console.log('  --type (optional) values: encode (default) | decode');
        console.log('  --file (optional)');
        return;
    }
    const defs = {
        path: dargs.path ?? __dirname,
        type: dargs.type ?? 'encode',
        file: dargs.file
    };
    function encodeJSON(str) {
        return str.replace(/((?![`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/0-9]))./gm, (v) => {
            return ('\\u' + ('0000' + v.codePointAt(0).toString(16).split(/(..)/).filter(String)).slice(-4));
        });
    }
    fs_1.readdirSync(path_1.resolve(defs.path)).forEach(file => {
        if (defs.file === undefined || (defs.file && defs.file === file)) {
            switch (defs.type) {
                case 'decode':
                    const d1 = JSON.stringify(JSON.parse(fs_1.readFileSync(path_1.join(defs.path, file)).toString('utf-8').replace(/\r\n/g, '')), null, 2);
                    fs_1.writeFileSync(path_1.join(defs.path, file), d1);
                    break;
                case 'encode':
                default:
                    const d0 = JSON.stringify(JSON.parse(fs_1.readFileSync(path_1.join(__dirname, '../tests/0.json')).toString('utf-8').replace(/\r\n/g, '')));
                    fs_1.writeFileSync(path_1.join(defs.path, file), encodeJSON(d0));
                    break;
            }
        }
    });
})();
