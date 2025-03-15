import { readFileSync } from 'node:fs'
import { defineConfig, logger, RsbuildPluginAPI } from '@rsbuild/core'

const pkg = JSON.parse(readFileSync("./package.json"))

logger.override({
    warn: msg=>logger.info(msg.split("\n")[0],`${msg.length}字的警告信息被隐藏...`)
})

const distFilename = `${pkg.name}.js`
const VERSION = ()=>{
    let now = new Date
    return `v${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
}

export default defineConfig({
    source:{
        entry:{ index: './src/server.js' },
        define:{
            "VERSION": JSON.stringify(VERSION())
        }
    },
    output:{
        copy:[
            { from: "./node_modules/better-sqlite3/build/Release/better_sqlite3.node", to:"lib"},
        ],
        legalComments:"none",
        target:"node",
        // charset: 'ascii',
        /**
         * 使用 Objection.js 和 Knex 时，Knex 会尝试加载其他数据库的依赖（如 pg、mysql 等）
         * 即使你只使用了 sqlite3。这些数据库驱动默认在 Knex 的代码中被 require，
         * 但未实际安装，导致在使用打包工具（如 rsbuild）时报错
         */
        externals:[
            'pg', 'pg-query-stream','oracledb', 'tedious', 'sqlite3', 'mysql', 'mysql2'
        ],
        filename:{
            js: distFilename
        }
    }
})

