const { Model } = require('objection')
const logger = require('../common/logger')
const { default : KnexBuilder, Knex } = require('knex')

const SQLITE = "sqlite3"
const MYSQL = "mysql"

/**
 * @type {Knex}
 */
let knex

module.exports = {
    MYSQL, SQLITE,

    getKnex: ()=> knex,
    /**
     *
     * @param {ServerConfig} config
     */
    setupDB: config=>{
        const { db } = config
        const connection = {}

        if(db.type == MYSQL){
            if(!!db.uri)
                connection.uri = db.uri
            else {
                connection.host = db.host
                connection.port = db.port
                connection.database = db.database
                connection.user = db.user
                connection.password = db.password
                connection.charset = db.charset
            }
        }
        else if(db.type == SQLITE){
            connection.filename = db.file
            //使用特定的 .node 目录
            if(process.env.NODE_ENV === 'production'){
                connection.options = {
                    nativeBinding: "lib/better_sqlite3.node"
                }
            }
        }
        else {
            throw `仅支持以下数据库：${SQLITE}、${MYSQL}`
        }

        knex = KnexBuilder({
            debug: global.showSQL == true,
            client: db.type == SQLITE?"better-sqlite3":db.type,
            connection,
            useNullAsDefault: db.type == SQLITE,
            pool:{
                max: 5,
                acquireTimeoutMillis: 8*1000,
                idleTimeoutMillis: 10*1000
            }
        })

        Model.knex(knex)
        logger.debug(`初始化数据库连接：${db.type}/${db.database}`, connection)
    }
}
