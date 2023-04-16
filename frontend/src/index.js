// React
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

// Project
import App from './components/App/App'
import store from './store/store'

// CSS
import './components/App/main.scss'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
