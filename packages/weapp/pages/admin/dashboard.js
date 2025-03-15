const { datetime } = require("../../utils/date")
const { RESULT } = require("../../utils/http")
const { filesize, showConfirm, ok, showInput } = require("../../utils/util")

const buildTip = list => Array.isArray(list)&&list.length?"默认显示前 20 条数据":"暂无数据"

Page({
    data: {
        offsetTop: 87,
        color:"#0052d9cc",
        size: '64rpx',
        showZero: true,
        maxCount: 99999,

        loading: true,
        v: {},

        applys: [],
        applyText: "",

        users: []
    },
    onLoad() {
        RESULT("/system/dashboard", {}, d=>{
            let v = d.data
            if(v.db)    v.db = filesize(v.db)
            if(v.cache) v.cache = filesize(v.cache)
            if(v.mem)   v.mem = filesize(v.mem)
            this.setData({ v, loading: false })
        })
    },
    onTabsChange (e){
        let { value } = e.detail
        if(value == 'apply' && this.data.applys.length==0){
            RESULT("/system/apply-list", {}, d=>{
                d.data.forEach(a=>a.addOn = datetime(a.addOn))
                this.setData({applys: d.data, applyText: buildTip(d.data)})
            })
        }
        else if(value == 'user' && this.data.users.length==0){
            RESULT("/system/user-authed", {}, d=>{
                d.data.forEach(a=>a.addOn=datetime(a.addOn, "YYYY-MM-DD HH:mm"))
                this.setData({ users: d.data })
            })
        }
    },
    dealApply (e){
        let { index, action } = e.currentTarget.dataset
        let { applys } = this.data
        let isDel = action == 'del'
        let bean = applys[index]
        showConfirm(`操作确认`, `确定${isDel?"删除":"同意"}该申请吗？`, ()=>{
            RESULT(`/system/apply-${action}`, { id: bean.id }, ()=>{
                ok(action=='done'?"授权完成":"已删除")
                applys.splice(index, 1)
                let data = { applys, applyText: buildTip(applys) }
                if(!isDel)
                    data.users = []
                this.setData(data)
            })
        })
    },
    dealUser (e){
        let { index } = e.currentTarget.dataset
        let { users } = this.data
        let bean = users[index]
        showConfirm(`操作确认`, `撤销该用户的⌈${bean.role}⌋角色吗？`, ()=>{
            RESULT("/system/user-revoke", { id: bean.id }, ()=>{
                ok(`操作成功`)
                users.splice(index, 1)
                this.setData({ users })
            })
        })
    },
    renameUser (e){
        let { index, type } = e.currentTarget.dataset
        let { users, applys } = this.data
        let fromApply = type == 'apply'
        let bean = fromApply?applys[index]:users[index]
        showInput(`修改用户名称`, fromApply?"":bean.name, name=>{
            RESULT("/system/user-rename", { id: fromApply?bean.uid:bean.id, name }, ()=>{
                ok(`名称修改成功`)
                if(!fromApply){
                    bean.name = name
                    this.setData({ users })
                }
            })
        })
    },
    copyUid (e){
        let { index } = e.currentTarget.dataset
        wx.setClipboardData({ data: this.data.users[index].id, success:()=>ok(`ID已复制`) })
    }
})