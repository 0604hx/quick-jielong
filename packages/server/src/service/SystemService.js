const { statSync } = require('node:fs')
const os = require('node:os')
const { datetime } = require("../common/date")
const logger = require("../common/logger")
const config = require("../config")
const Entry = require("../db/Entry")
const Jielong = require("../db/Jielong")
const { OpLog } = require("../db/System")
const User = require("../db/User")
const { ADD_ON, DAY } = require("../fields")
const { withCache } = require("./CacheService")
const { stats } = require('../common/cache')

module.exports = {
    /**
     *
     * @param {OpLog} op
     * @param {String} mod
     * @param {Boolean}
     */
    saveOpLog : (op, showLogger=true)=>{
        if(config.sys.log){
            if(!op.addOn)
                op.addOn = Date.now()

            OpLog.query().insert(op).then()
        }

        showLogger && logger.info(`${op.uid}${op.summary}`)
    },

    dashboard : async ()=> withCache(`dashboard`, async ()=>{
        let time = Date.now() - 7*24*60*60*1000
        return {
            'recentUser'        : await User.count(ADD_ON, time, ">="),
            'recentJielong'     : await Jielong.count(ADD_ON, time, ">="),
            'recentEntry'       : await Entry.count(DAY, time, ">="),
            'user'              : await User.count(),
            'jielong'           : await Jielong.count(),
            'entry'             : await Entry.count(),
            'os'                : `${os.platform()} / Node ${process.version}`,
            'uptime'            : datetime(new Date(Date.now() - process.uptime()*1000)),
            'mem'               : process.memoryUsage.rss(),
            'db'                : statSync(config.db.file).size,
            'cache'             : stats().vsize,
            'updateOn'          : datetime()
        }
    })
}
