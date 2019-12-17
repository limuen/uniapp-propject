import http from '../utils/request.js'


export function getAddressList(){
	return http.get({
	    url: '/userAddress'
	})
}

/* 
	@params Object
	{
		address          //详细地址
		area             //区县
		city             //城市
		province         //省份
		defaultEnable    // 是否默认地址   number    1 默认地址
		name             //收货人姓名
		phone            //收货人电话
	}
 */
export function addAddress(params){
	return http.post({
	    url: '/userAddress',
		data:params
	})
}


export function deleteAddress(id){
	return http.delete({
	    url: '/userAddress/' + id
	})
}


export function updateAddress(params){
	return http.put({
	    url: '/userAddress',
		data:params
	})
}