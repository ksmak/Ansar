import { createSlice } from '@reduxjs/toolkit'


export const ansarClientSlice = createSlice({
  name: 'ansarClient',
  initialState: {
    user: {
      username: '',
      isAuthenticate: false,
    },
    rooms: [],
  },
  reducers: {
    login: (state, action) => {
      state.user.username = action.payload.username;
      state.user.isAuthenticate = true;
    },
    logout: (state) => {
      state.user.username = '';
      state.user.isAuthenticate = false;
    },
    setRooms: (state, action) => {
      state.rooms = action.payload
    },
    selectRoom: (state, action) => {
      state.rooms.find(item => item.id === action.payload).active = true;
    }
  },
})


export const { login, logout, setRooms, selectRoom } = ansarClientSlice.actions

export default ansarClientSlice.reducer