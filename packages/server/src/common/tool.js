const { customAlphabet } = require('nanoid')
const { readdirSync, unlinkSync, statSync, rmdirSync } = require('node:fs')
const { resolve } = require('node:path')
const os = require('node:os')
const config = require('../config')
const { SQLITE } = require('../db')
const { execSync, spawnSync } = require('node:child_process')
const { datetime } = require('./date')

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 16)
const nanoidUPER = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 16)
/**
 *
 * @param {String} dir
 */
const emptyDir = dir=>{
    let files = readdirSync(dir)
    files.forEach(f=>{
        let p = resolve(dir, f)
        if(statSync(p).isDirectory()){
            emptyDir(p)
            rmdirSync(p)
        }
        else
            unlinkSync(p)
    })
}

/**
 * 随机生成ID
 * @param {Number} len
 * @returns
 */
exports.uuid = (len=16)=> nanoid(len)

exports.uuidUpper = (len=16)=> nanoidUPER(len)

exports.emptyDir = emptyDir

/**
 * @typedef {Object} AppStats - 应用运行状态
 * @property {String} arch - 架构
 * @property {String} os - 操作系统
 * @property {String} runtime - 运行时版本
 * @property {String} cpu - 处理器描述信息
 * @property {Number} memTotal - 总内存
 * @property {Number} memUse - 已用内存
 * @property {String} started - 启动日期
 *
 *
 * @returns {AppStats}
 */
exports.osAndAppStats = async () => {
    let cpus = os.cpus()
    let speed = cpus.length>0?cpus[0].speed:0
    speed = speed<1000?`${speed}MHz`:`${speed/1000}GHz`

    return {
        platform: os.platform(),
        arch: os.arch(),
        os: os.release(),
        runtime: process.version,
        cpu: `${cpus.length}核心 ${speed}`,
        memTotal: os.totalmem(),
        memUse: process.memoryUsage.rss(),
        started: datetime(new Date(Date.now() - process.uptime()*1000)),
        dbSize: config.db.type==SQLITE? statSync(config.db.file).size:0,
        dbType: config.db.type
    }
}

/**
 * 执行系统命令行
 * @param {String} cmd
 * @returns {Boolean}
 */
exports.runOSCmd = (cmd, args=[])=>{
    let re = spawnSync(cmd, args, {timeout: 1000})
    if(re.status == 0)
        return re.stdout.toString().trim()
    throw re.error? re.error.message : re.stderr.toString().trim()
}

/**
 * 模拟暂停
 * @param {Number} ms - 等待毫秒数
 * @returns {Promise}
 */
exports.sleep = (ms=2000)=> new Promise(ok=> setTimeout(ok, ms))

/**
 * 对字符串打码
 * @param {String} text
 * @param {String} c
 * @returns {String}
 */
exports.maskText = (text, c="*")=>{
    let size = text.length
    if(size <= 1)   return text
    if(size == 2)   return text[0]+c
    let t = Math.ceil(size/3)
    let t2 = Math.floor(size/3)

    return text.substring(0, t) + c.repeat(t2) + text.substring(t+t2)
}

/**
 *
 * @param {Number} day
 * @returns
 */
exports.dayToMS = day=> day*24*60*60*1000
