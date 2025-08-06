const logger = require("../src/common/logger");
const { joinJielong } = require("../src/service/JielongService");
const { withDB, T_JIELONG_ID, T_USER_ID } = require("./abstract.db");

withDB(async ()=>{
    logger.debug(`开始参与接龙，ID=${T_JIELONG_ID}  UID=${T_USER_ID}`)
    await joinJielong(T_JIELONG_ID, T_USER_ID, "测试")
}, "参与接龙")
