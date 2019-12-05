# mysql-table-types

Export mysql tables schema to TypeScript declaration.

## Why

1. I'm using nodejs
1. I'm using [mysqljs](https://github.com/mysqljs/mysql)
1. I'm in love with TypeScript or the [\*.d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
1. I'm looking for some MAGIC writing TypeScript declaration of my HUNDREDS-of-mysql-tables for me

## How

### Cli

```
npm i -g mysql-table-types
mysql-table-types -i db.json
```

or

```
npx mysql-table-types -i db.json
```

or

```
npx mysql-table-types -i db.json -o db.d.ts
```

### Manual

```javascript
const mtt = require('mysql-table-types');
const listOfTableSchemaStrings = mtt(yourMysqlConnSomewhere.config);
```
