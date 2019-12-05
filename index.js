const mysql = require('mysql');
const Types = mysql.Types;

// https://github.com/mysqljs/mysql#type-casting
// https://github.com/mysqljs/mysql/blob/5569e02ad72789f4b396d9a901f0390fe11b5b4e/lib/protocol/packets/RowDataPacket.js#L57
function toTsType(mysqlType) {
    switch (mysqlType) {
        case Types.TIMESTAMP:
        case Types.TIMESTAMP2:
        case Types.DATE:
        case Types.DATETIME:
        case Types.DATETIME2:
        case Types.NEWDATE:
            return 'Date';

        case Types.TINY:
        case Types.SHORT:
        case Types.LONG:
        case Types.INT24:
        case Types.YEAR:
        case Types.FLOAT:
        case Types.DOUBLE:
        case Types.NEWDECIMAL:
        case Types.LONGLONG:
            return 'Number';

        case Types.BIT:
        case Types.STRING:
        case Types.VAR_STRING:
        case Types.TINY_BLOB:
        case Types.MEDIUM_BLOB:
        case Types.LONG_BLOB:
        case Types.BLOB:
        case Types.GEOMETRY:
            return 'String';

        default:
            return 'String';
    }
}

function toTypeDef(tableName, fieldInfos) {
    const props = [];
    for (const f of fieldInfos) {
        const questionMark = f.notNull ? '' : '?';
        const tsType = toTsType(f.type);
        props.push(`    ${f.name + questionMark}: ${tsType};`);
    }

    return `
interface ${tableName} {
${props.join('\n')}
}
    `;
}

/**
 * @param {object} mysqlConfig
 * @returns {Promise<string[]>}
 */
async function generate(mysqlConfig) {
    const connection = mysql.createConnection(mysqlConfig);
    connection.connect();

    const queryResults = function(sql) {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    };
    const queryFields = function(sql) {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, results, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fields);
                }
            });
        });
    };

    const tResults = await queryResults(`SHOW TABLES;`);
    const tableNames = [];
    for (const t of tResults) {
        const vals = Object.values(t);
        tableNames.push(vals[0]);
    }

    const defs = [];
    for (const tn of tableNames) {
        const fields = await queryFields(`SELECT * FROM ${tn} LIMIT 0;`);
        const infos = [];
        for (const f of fields) {
            // https://github.com/mysqljs/mysql/blob/master/lib/protocol/constants/field_flags.js#L2
            const notNull = f.flags & 1;
            const { type, name } = f;

            infos.push({
                type,
                notNull,
                name
            });
        }
        const def = toTypeDef(tn, infos);
        defs.push(def);
    }

    connection.end();
    return defs;
}

module.exports = generate;
