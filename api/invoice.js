import http from '../utils/request.js'


export function getInvoiceList(){
	return http.get({
	    url: '/userReceipt'
	})
}


/* 
	@params    Object 
	{
		defaultEnable		是否默认
		email               发票Email
		title		        发票抬头
	}
 */
export function addInvoice(params){
	return http.post({
	    url: '/userReceipt',
		data:params
	})
}


export function deleteInvoice(id){
	return http.delete({
	    url: '/userReceipt/' + id
	})
}


/* 
	@params    Object 
	{
		defaultEnable		是否默认
		email               发票Email
		title		        发票抬头
        id                  发票id
	}
 */
export function updateInvoice(params){
	return http.put({
	    url: '/userReceipt',
        data:params
	})
}