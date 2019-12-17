import http from '../utils/request.js'

/* 
	@params Object
	{
		commodityClassificationId         //商品分类id
		commodityId                       //商品id
		keyword                           // 模糊搜索关键字
		pageSize                          //每页数量
		pageNum                           //页码
	}
 */
export function getCommodityList(params) {
  return http.get({
    url: '/commodity/commodityInfos',
    data: params
  })
}

export function getWarehouseDetails(id) {
  return http.get({
    url: '/commodity/inventory/' + id
  })
}

export function getCommodityColor(commodityId) {
  return http.get({
    url: '/commodity/colour',
    data: {
      commodityId
    }
  })
}

export function getWarehouse(commodityId, commodityColourId) {
  return http.get({
    url: '/commodity/inventory/colour',
    data: {
      commodityId,
      commodityColourId
    }
  })
}
