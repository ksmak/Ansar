import axios from 'axios';

const instance = axios.create({
	baseURL: process.env.REACT_APP_API_HOST,
	headers: {
		'Content-Type': 'application/json',
	},
})

instance.interceptors.request.use((config) => {
	config.headers.Authorization = `Bearer ${sessionStorage.getItem('access')}`;
	return config;
});

instance.interceptors.response.use((config) => {
	return config;
}, (async error => {
		const originalRequest = error.config;
  		if (error.response.status === 401 && error.config && !error.config._isRetry) {
     		originalRequest._isRetry = true;
     		const response = await axios.post(`${process.env.REACT_APP_API_HOST}/api/token/refresh/`, {
            		refresh: sessionStorage.getItem('refresh')
                }, { 
				headers: {
						'Content-Type': 'application/json'
                }
            }, { withCredentials: true });
    	
			if (response.status === 200) {
				sessionStorage.setItem('access', response.data.access);
				return instance.request(originalRequest);
			} else {
				console.log('No authorization.');
				sessionStorage.removeItem('access');
				sessionStorage.removeItem('refresh');
			}
  		}
		return error;
}));

export default instance