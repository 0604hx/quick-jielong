const { setupDB } = require("../src/db")
const config = require("../src/config")
const logger = require("../src/common/logger")

global.showSQL = true

module.exports = {
    T_JIELONG_ID  : "2EJ9PRS20Z",
    T_USER_ID     : "TEST",

    /**
     *
     * @param {Function} worker
     * @param {String} name
     */
    withDB : (worker, name)=>{
        setupDB(config)

        let jobName = name?` <${name}> `:""

        new Promise(async (ok, fail)=>{
            logger.debug(`作业${jobName}开始`)
            try{
                ok(await worker())
            }catch(e){
                logger.error(`作业${jobName}出错`, e)
                process.exit()
            }
        }).then(d=>{
            logger.debug(`作业${jobName}完成`, d)

            process.exit()
        })
    }
}
