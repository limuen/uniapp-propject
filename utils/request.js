/**
 * 通用uni-app网络请求
 * 基于 Promise 对象实现更简单的 request 使用方式，支持请求和响应拦截
 */

export default {
    config: {
        baseUrl: process.env.NODE_ENV === 'production' ? "线上" : "本地", 
        header: {
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Requested-Organization-Id': process.env.NODE_ENV === 'production' ? 2 : 1
        },
        data: {},
        method: "GET",
        dataType: "json",
        /* 如设为json，会对返回的数据做一次 JSON.parse */
        responseType: "text",
        success() {},
        fail() {},
        complete() {}
    },
    interceptor: {
        request: null,
        response: (res) => {
            return res
        }
    },
    request(options) {
        if (!options) {
            options = {}
        }
        options.baseUrl = options.baseUrl || this.config.baseUrl
        options.dataType = options.dataType || this.config.dataType
        options.url = options.baseUrl + options.url
        options.data = options.data || {}
        options.method = options.method || this.config.method
        //TODO 加密数据

        //TODO 数据签名

        let _token = {
            'X-Requested-Token': uni.getStorageSync('token') || ''
        }
        // _sign = {'sign': sign(JSON.stringify(options.data))}
        options.header = Object.assign({}, this.config.header, options.header || {}, _token)

        return new Promise((resolve, reject) => {
            let _config = null

            options.complete = (response) => {
                let statusCode = response.statusCode
                response.config = _config
                // if (process.env.NODE_ENV === 'development') {
                // 	if (statusCode === 200) {
                // 		console.log("【" + _config.requestId + "】 结果：" + JSON.stringify(response.data))
                // 	}
                // }
                if (this.interceptor.response) {
                    let newResponse = this.interceptor.response(response)
                    if (newResponse) {
                        response = newResponse
                    }
                }
                // 统一的响应日志记录
                // _reslog(response)
                if (statusCode === 200) { //成功
                    if (response.data.status === 400) {
                        if (response.data.message !== '操作失败！' && !response.config.url.includes('/onlinepay/confirm')) {
                            uni.showToast({
                                title: response.data.message,
                                icon: 'none'
                            });
                        }
                        reject(response)
                        return
                    }

                    if (response.data.accessToken) uni.setStorageSync('token', response.data.accessToken);
                    resolve(response.data.data);
                } else if (statusCode === 401) {
                    if (response.config.url.indexOf('userInfo') < 0 && response.config.url.indexOf(
                            'orderStatus') < 0) {
                        uni.navigateTo({
                            url: '/pages/login/login',
                        });
                    }
                    reject(response)
                } else {
                    uni.showToast({
                        title: (response && response.data && response.data.message) || '服务器错误',
                        icon: 'none'
                    });
                    reject(response)
                }
            }

            _config = Object.assign({}, this.config, options)
            // _config.requestId = new Date().getTime()

            if (this.interceptor.request) {
                this.interceptor.request(_config)
            }

            // 统一的请求日志记录
            // 			_reqlog(_config)
            // 
            // 			if (process.env.NODE_ENV === 'development') {
            // 				console.log("【" + _config.requestId + "】 地址：" + _config.url)
            // 				if (_config.data) {
            // 					console.log("【" + _config.requestId + "】 参数：" + JSON.stringify(_config.data))
            // 				}
            // 			}

            uni.request(_config);
        });
    },
    get({
        url,
        data,
        options
    }) {
        if (!options) {
            options = {}
        }
        options.url = url
        options.data = data
        options.method = 'GET'
        return this.request(options)
    },
    post({
        url,
        data,
        options
    }) {
        if (!options) {
            options = {}
        }
        options.url = url
        options.data = data
        options.method = 'POST'
        return this.request(options)
    },
    put({
        url,
        data,
        options
    }) {
        if (!options) {
            options = {}
        }
        options.url = url
        options.data = data
        options.method = 'PUT'
        return this.request(options)
    },
    delete({
        url,
        data,
        options
    }) {
        if (!options) {
            options = {}
        }
        options.url = url
        options.data = data
        options.method = 'DELETE'
        return this.request(options)
    }
}


/**
 * 请求接口日志记录
 */
// function _reqlog(req) {
// 	if (process.env.NODE_ENV === 'development') {
// 		console.log("【" + req.requestId + "】 地址：" + req.url)
// 		if (req.data) {
// 			console.log("【" + req.requestId + "】 请求参数：" + JSON.stringify(req.data))
// 		}
// 	}
// 	//TODO 调接口异步写入日志数据库
// }
// 
// /**
//  * 响应接口日志记录
//  */
// function _reslog(res) {
// 	let _statusCode = res.statusCode;
// 	if (process.env.NODE_ENV === 'development') {
// 		console.log("【" + res.config.requestId + "】 地址：" + res.config.url)
// 		if (res.config.data) {
// 			console.log("【" + res.config.requestId + "】 请求参数：" + JSON.stringify(res.config.data))
// 		}
// 		console.log("【" + res.config.requestId + "】 响应结果：" + JSON.stringify(res))
// 	}
// 	//TODO 除了接口服务错误外，其他日志调接口异步写入日志数据库
// 	switch(_statusCode){
// 		case 200:
// 			break;
// 		case 401:
// 			break;
// 		case 404:
// 			break;
// 		default:
// 			break;
// 	}
// }
