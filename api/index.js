import http from '../utils/request.js'


export function getCategoryList(){
	return http.get({
	    url: '/commodity/classifications'
	})
}