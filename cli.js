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
const log = v ? console.log : () => {};
const confStr = fs.readFileSync(i);

log('generating....');
generate(JSON.parse(confStr))
    .then(defs => {
        log(`${defs.length} tables parsed....`);
        if (!o) {
            for (const def of defs) {
                log(def);
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
