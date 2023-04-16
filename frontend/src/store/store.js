import { configureStore } from '@reduxjs/toolkit'
import ansarClientReducer from '../slices/ansarClientSlice'

export default configureStore({
  reducer: {
    ansarClient: ansarClientReducer,
  },
})