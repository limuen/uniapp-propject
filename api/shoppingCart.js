import http from '../utils/request.js'


export function getShopping(){
	return http.get({
	    url: '/shopping'
	})
}


/* 
	@params  shoppingList   Object  所有购物车商品列表  （之前购物车列表+新增购物车商品）
	{
		commodityId				商品id
		commodityInventoryId    商品库存id
		selectQuantity		选择的数量
	}
 */
export function addShopping(shoppingList){
	return http.post({
	    url: '/shopping',
		data:{
			shoppingList
		}
	})
}


export function deleteShopping(shoppingList){
	return http.delete({
	    url: '/shopping',
        data:{
            shoppingList
        }
	})
}



export function updateShopping(shoppingList){
	return http.put({
	    url: '/shopping',
        data:{
            shoppingList
        }
	})
}