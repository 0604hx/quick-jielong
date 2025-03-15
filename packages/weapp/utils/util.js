const isDev = wx.getAccountInfoSync().miniProgram.envVersion == "develop"

exports.isDev = isDev

/**
 * 显示普通的提示信息（微信原生）
 * @param {String} title - 标题
 * @param {Number} duration - 存活时间
 * @param {Boolean} showCancel - 是否显示取消按钮
 * @param {String} image - 图片地址
 */
exports.warn = (title, duration=2500, showCancel=true, image)=>{
    wx.showToast({ title, icon:"error", duration, image, showCancel })
}

/**
 * 微信原生的成功提示
 * @param {String} title 
 */
exports.ok = title=> wx.showToast({title})

/**
 * 出错弹窗
 * @param {String} content 
 * @param {String} title 
 * @param {Function} onOk 
 */
exports.showError = (content, title="操作失败", onOk=()=>{})=>{
    wx.showModal({
        title,
        content,
        showCancel: false,
        confirmColor: "#ed4014",
        success (res) {
            if (res.confirm) {
                onOk()
            }
        }
    })
}

/**
* 弹出咨询对话框
* @param {*} title 
* @param {*} content 
* @param {*} onOk 
* @param {*} onCancel 
*/
exports.showConfirm = (title, content, onOk=()=>{}, onCancel=()=>{})=>{
   wx.showModal({
       title,
       content,
       success (res) {
           if (res.confirm) {
               onOk()
           } else if (res.cancel) {
               onCancel()
           }
       }
   })
}

exports.showInput = (title, content, ok)=>{
    wx.showModal({
      title,
      content,
      editable: true,
      success: (res) => {
          if(res.confirm == true)
            ok && ok(res.content)
      }
    })
}


/**
 * 格式化文件大小
 * @param {Number} mem 
 * @param {Number} fixed 
 * @param {String} split 
 */
exports.filesize =  (mem, fixed=1, split=" ")=>{
    var G = 0
    var M = 0
    var KB = 0
    mem >= (1 << 30) && (G = (mem / (1 << 30)).toFixed(fixed))
    mem >= (1 << 20) && (mem < (1 << 30)) && (M = (mem / (1 << 20)).toFixed(fixed))
    mem >= (1 << 10) && (mem < (1 << 20)) && (KB = (mem / (1 << 10)).toFixed(fixed))
    return G > 0
        ? G + split + 'GB'
        : M > 0
            ? M + split + 'MB'
            : KB > 0
                ? KB + split + 'KB'
                : mem + split + 'B'
}