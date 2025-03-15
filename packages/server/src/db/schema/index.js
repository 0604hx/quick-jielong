const { Knex } = require("knex")
const logger = require("../../common/logger")
const { getKnex } = require("..")
const { ID, NAME, ADD_ON, UID, TITLE, DAY, SUMMARY, QUANTITY, MODE, SECRET, EXPIRE, PID, UNAME, SEQ, PREFIX, CONTENT, ROLE, STATUS, TYPE } = require("../../fields")

const User = require("../User")
const Jielong = require("../Jielong")
const Entry = require("../Entry")
const { OpLog } = require("../System")
const Apply = require("../Apply")

/**
 * @callback BuilderFunction
 * @param {Knex.CreateTableBuilder} table
 *
 * @typedef {Object.<string, BuilderFunction>} Tables
 */

/**
 * @type {Tables}
 */
const tables = {
    [User.tableName]        : table=>{
        table.string(ID).primary()
        table.string(NAME)
        table.string(ROLE)
        table.bigint(ADD_ON)
    },
    [Jielong.tableName]     : table=>{
        table.string(ID).primary()
        table.string(UID).index()
        table.string(TITLE)
        table.bigint(DAY)
        table.string(SUMMARY)
        table.integer(QUANTITY)
        table.integer(MODE)
        table.boolean(SECRET)
        table.bigint(EXPIRE)
        table.bigint(ADD_ON)
    },
    [Entry.tableName]       : table=>{
        table.increments(ID).primary()
        table.string(PID).index()
        table.string(UID).index()
        table.string(UNAME)
        table.integer(SEQ)
        table.string(PREFIX)
        table.string(CONTENT)
        table.bigint(DAY)
    },
    [Apply.tableName]       : table=>{
        table.increments(ID).primary()
        table.string(UID)
        table.integer(STATUS)
        table.string(TYPE)
        table.bigint(ADD_ON)
    },
    [OpLog.tableName]       : table=>{
        table.increments(ID).primary()
        table.string(UID)
        table.string("platform")
        table.string("brand")
        table.string("version")
        table.string("mod")
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    }
}

/**
 * 初始化数据表
 */
exports.createTableIfNotExist =  async (knex=getKnex())=>{
    const names = Object.keys(tables)
    logger.info(`即将初始化数据库：`, names.join(","))

    const timing = Date.now()
    let created = 0
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        if(await knex.schema.hasTable(name)){
            logger.info(`表 ${name} 已经存在...`)
            continue
        }

        await knex.schema.createTable(name, tables[name])
        logger.info(`创建新表 ${name} :)`)
        created ++
    }

    logger.info(`初始化完成，共处理 ${names.length} 个表，建表 ${created} 个（耗时${(Date.now()-timing)} ms） :)`)
}

exports.runSQL = async (sql, ...params)=>{
    let knex = getKnex()
    return await knex.raw(sql)
}
