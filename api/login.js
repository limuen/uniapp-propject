import http from '../utils/request.js'

/* 
	@params  Object  
	{
		loginAccount   账号
		password	   密码
	}
 */
export function login(params){
	return http.post({
	    url: '/entrance/login',
		data:params
	})
}


export function logout(){
	return http.delete({
	    url: '/entrance/logout'
	})
}


/* 
	@params  Object  
	{
		loginAccount        账号
		password	        密码
		verificationCode    验证码
	}
 */
export function register(params){
	return http.post({
	    url: '/entrance/register',
		data:params
	})
}

/* 
	@params  phone  手机号码
 */
export function getVerificationCode(phone){
	return http.post({
	    url: '/entrance/verification/' + phone,
	})
}



export function getUserInfo(){
	return http.get({
	    url: '/userInfo',
        data:{
            showOrder:true
        }
	})
}

export function updateUserInfo(params){
	return http.put({
	    url: '/userInfo',
        data:params
	})
}



/* 
	@params  jsCode  微信登录拿到的code
 */
export function wxLogin(params){
	return http.get({
	    url: '/weixin/auth',
        data:params
	})
}

// 获取订单状态数量
export function orderStatus(){
    return http.get({
        url:'/orderInfo/orderStatus'
    })
}