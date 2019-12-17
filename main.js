import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

Vue.prototype.$tabBar = {
    "color": "#C1C0C9",
    "selectedColor": "#6DABFF",
    "backgroundColor": "#fff",
    "list": [{
            "pagePath": "/pages/index/index",
            "text": "首页",
            "iconPath": "/static/Home.png",
            "selectedIconPath": "/static/selectedHome.png"
        },
        {
            "pagePath": "/pages/inStock/inStock",
            "text": "库存",
            "iconPath": "/static/inStock.png",
            "selectedIconPath": "/static/selectedInStock.png"
        },
        {
            "pagePath": "/pages/shoppingCart/shoppingCart",
            "text": "购物车",
            "iconPath": "/static/cart.png",
            "selectedIconPath": "/static/cart.png",
            "isSpecial":true
        },
        {
            "pagePath": "/pages/bill/bill",
            "text": "账单",
            "iconPath": "/static/bill.png",
            "selectedIconPath": "/static/selectedBill.png"
        },
        {
            "pagePath": "/pages/my/my",
            "text": "我的",
            "iconPath": "/static/my.png",
            "selectedIconPath": "/static/selectedMy.png"
        }
    ]
}

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
