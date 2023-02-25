const ansarClientModule = (instance) => {
    return {
        login(params) {
            return instance({
                method: 'post',
                url: 'api/token/',
                data: params,
              })
        },
        get_rooms(params) {
            return instance.get('api/rooms/', params)
        },
        get_messages(params) {
            return instance.get('api/messages/', params)
        },
    }
}

export default ansarClientModule