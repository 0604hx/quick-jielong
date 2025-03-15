const { readFileSync, existsSync, statSync, watch } = require('node:fs')
const { debounce, merge } = require('lodash')
const logger = require('./common/logger')
const { CONFIG_FILE } = require('./fields')

const configFile = CONFIG_FILE

const config = {
    port: 10002,
    cors: !global.isPro ?? false,
    dataDir: "data",        //附近保存路径
    wwwDir: "www",          //静态资源目录
    wwwPrefix: "/www/",     //静态资源前缀，默认 /
    img: {
        toWebp: true,       //是否转换为 webp 格式
        exts: ["JPG","PNG","JPEG"],
        quality: 60,        //webp 质量（0到100）
    },
    appId:"wx5cfb481a6671ac83",
    appSecret:"",
    db: {
        prefix: "",
        type: "sqlite3",
        host: "localhost",
        port: 3306,
        user: "root",
        password: "",
        database: "jielong",
        uri:"",
        file:"jielong.db"
    },
    secret: {
        autoInit: true,
        sm4Key: "77db34252a08bde6a105a88424ff6483",
        jwtKey: "73ac265dbb88aa1edd8addceb7c1c7ac",
        jwtExpire: 180,
        // 携带 JWT 的请求头名称，请填写小写
        header: "token",
        // 管理员ID
        adminIds:["oje73676eurApzp4BslyTFa4AycA"]
    },
    http: {
        // /common/** 资源的缓存时间，设置小于等于0则不推荐缓存头
        commonExpire: 3600
    },
    sys :{
        log: true,              //是否记录操作日志
        logMax: 360,            //日志存活天数
    }
}

const loadConfig = ()=> {
    let fileCfg = JSON.parse(readFileSync(configFile, { encoding: 'utf-8' }))
    merge(config, fileCfg)
    return fileCfg
}

if(existsSync(configFile) && statSync(configFile).isFile()){
    let fileCfg = loadConfig()
    //开启监听
    const onConfigChange = debounce(()=>{
        logger.info("监听到配置文件变化 :)", configFile)
        loadConfig()
    }, 1000)

    //仅当生产模式才监听配置文件的变动
    if(global.isPro)
        watch(configFile, onConfigChange)

    global.isDebug && logger.debug(`从${configFile}中读取配置文件`, fileCfg)
}

module.exports = config
