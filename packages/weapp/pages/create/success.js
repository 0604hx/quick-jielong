const { buildDetailShare, checkRoleOfData } = require("../../utils/tool")

Page({
    data: {
        id: undefined,
        title: undefined,
        day: undefined
    },
    onLoad ({ id, title, day }){
        if(!checkRoleOfData())
            return wx.redirectTo({ url: '/pages/other/about' })
        
        this.setData({ id, title, day })
    },
    onShareAppMessage (){
        let { day, title, id } = this.data
        return buildDetailShare(id, title, day)
    },
    toDetail (){
        wx.redirectTo({ url:`/pages/view/detail?id=${this.data.id}` })
    },
    toHome (){
        wx.redirectTo({ url:'/pages/index/index' })
    }
})