const ansarClientModule = (instance) => {
    return {
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
        }
    }
}

export default ansarClientModule