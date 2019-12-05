#!/usr/bin/env node
const generate = require('./index');
const fs = require('fs');
const path = require('path');

const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .describe('o', 'ouput file path (omit to console)')
    .describe('i', 'input mysqljs conn config file path')
    .describe('v', 'little more logs')
    .demandOption(['i']).argv;

const { i, o, v } = argv;
function log(sth, force = false) {
    if (force || v) {
        console.log(sth);
    }
}

log('generating....');
const confStr = fs.readFileSync(i);
generate(JSON.parse(confStr))
    .then(defs => {
        log(`${defs.length} tables parsed....`);
        if (!o) {
            for (const def of defs) {
                log(def, true);
            }
        } else {
            const allDefsStr = defs.join('');
            log('writing....');
            fs.writeFileSync(o, allDefsStr);
        }
        log('done!');
    })
    .catch(err => {
        throw err;
    });
