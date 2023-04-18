import axios from 'axios';

const instance = axios.create({
	baseURL: "http://127.0.0.1:8000",
	headers: {
		'Content-Type': 'application/json',
	},
})

instance.interceptors.request.use((config) => {
	config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`;
	return config;
});

instance.interceptors.response.use((config) => {
	return config;
}, (async error => {
		const originalRequest = error.config;
  		if (error.response.status == 401 && error.config && !error.config._isRetry) {
     		originalRequest._isRetry = true;
     		const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
            		refresh: localStorage.getItem('refresh')
                }, { 
				headers: {
						'Content-Type': 'application/json'
                }
            }, { withCredentials: true });
    	
			if (response.status === 200) {
				localStorage.setItem('access', response.data.access);
				return instance.request(originalRequest);
			} else {
				console.log('НЕ АВТОРИЗОВАН');
				localStorage.removeItem('access');
				localStorage.removeItem('refresh');
				localStorage.removeItem('user');
			}
  		}
		return error;
}));

export default instance