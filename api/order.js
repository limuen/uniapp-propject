import http from '../utils/request.js'


/* 
	@params    Object 
	{
		startTime   		    开始时间
		endTime                 结束时间
		orderId		            订单id
        status                  订单状态    0：取消，1：未付款，2：已付款，3：待发货，4：已发货，5：已完成，
                                            6：退货申请，7：退货申请通过，8：退货申请未通过，9：退货中，10：退货异常，11:退货完成
        statusStr               订单状态列表
        paging                  设置是否要进行分页查询
        pageSize                每页的数量
        pageNum                 页码
	}
 */
export function getOrder(params) {
    return http.get({
        url: '/orderInfo',
        data: params
    })
}


/* 
	@params 
	{
		id		                订单id
        status                  订单状态
	}
 */
export function updateOrderStatus(params) {
    return http.put({
        url: '/orderInfo',
        data: params
    })
}



/* 
	@params preOrderCommodityList
		
    [
        {
            "amount":10,                                                    价格       
            "commodityId":"293f109e-ee5c-421d-b835-b85cf50afad7",           商品id
            "commodityInventoryId":"2aab87b6-d033-4578-842e-5dd87bf61861",  商品库存id
            "selectQuantity":10                                             数量
        }
    ]
 */
export function getPreparatoryOrder(params) {
    return http.put({
        url: '/orderInfo/calculate',
        data: {
            preOrderCommodityListStr: JSON.stringify(params) 
        }
    })
}



export function addOrder(params) {
    return http.post({
        url: '/orderInfo',
        data: params
    })
}




export function payOrder(id) {
    return http.put({
        url: '/orderInfo/pay',
        data: {
            id,
            payWay:'微信'
        }
    })
}


export function getDeliveryList() {
    return http.get({
        url: '/express/info'
    })
}


/* 
 {"expressCommpany":"快递公司名称","province":"快递省份","warehouseId":"WMS仓库ID","wmsOrgId":"WMS集团ID"}]
 @params Array
    [{
        "expressCommpany"                       快递公司名称       
        "province":"                            快递省份
        "warehouseId":                          WMS仓库ID
        "wmsOrgId":                             WMS集团ID
    }]
 */
export function getDeliveryFreight(params) {
    return http.put({
        url: '/express/freight',
        data: params
    })
}

/* 
 @params 
   expressno                                    快递单号
 */
export function getTracks(expressno) {
    return http.get({
        url: '/express/tracks',
        data: {expressno}
    })
}

export function getJudgeOrder(orderId) {
    return http.get({
        url: '/onlinepay/judge-order',
        data: {payAim:'ORDER_PAY',orderId}
    })
}