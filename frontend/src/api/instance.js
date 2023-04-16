import axios from 'axios'

const instance = axios.create({
	baseURL: 'http://127.0.0.1:8000',
	headers: {
		'Content-Type': 'application/json',
	},
})

instance.interceptors.request.use(
	request => {
		axios.defaults.headers.common['authorization'] = `Bearer ${sessionStorage.getItem('access_token')}`
				
		return request
	},
	error => {
		return Promise.reject(error)
	}
)

export default instance