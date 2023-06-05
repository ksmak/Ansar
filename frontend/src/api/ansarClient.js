const ansarClientModule = (instance) => {
    return {
        async test() {
            instance.post('api/test/')
            .then(() => true)
            .catch(() => false)
        },
        login(params) {
            return instance({
                method: 'post',
                url: 'api/token/',
                data: params,
              })
        },
        get_users() {
            return instance.get('api/users/');
        },
        get_chats() {
            return instance.get('api/chats/')
        },
        upload_file(formData) {
            return instance.post('api/uploadfile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
    }
}

export default ansarClientModule