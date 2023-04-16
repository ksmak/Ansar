// React, Redux, WebSocket
import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from "react-router-dom"
import useWebSocket, { ReadyState } from "react-use-websocket"

// Project
import api from '../../../api/index'
import { setRooms, selectRoom } from '../../../slices/ansarClientSlice'

// Components
import RoomList from "../../UI/RoomList/RoomList"
import MessageList from "../../UI/MessageList/MessageList"
import Button from "../../UI/Button/Button"
import Textarea from "../../UI/Textarea/Textarea"

// CSS
import cls from './MainPage.module.scss'


const MainPage = () => {
  const dispatch = useDispatch()
  
  const user = useSelector((state) => state.ansarClient.user)
  const rooms = useSelector((state) => state.ansarClient.rooms)
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState([])
  const [socketUrl, setSocketUrl] = useState("ws://127.0.0.1:8000/rooms/");

  useEffect(() => {
    api.ansarClient.get_rooms()
      .then((resp) => {
        dispatch(setRooms(resp.data))
      })
      .catch((error) => {
        console.log('Error', error.message)
      })
  }, [dispatch])

  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessages(prev => prev.concat(lastJsonMessage))
    }
  }, [messages, lastJsonMessage])
  
  const { readyState, sendJsonMessage, lastJsonMessage } = useWebSocket(
    socketUrl, {
    queryParams: {
      token: sessionStorage.getItem('access_token')
    },
    onOpen: () => {
      console.log("Connected!")
    },
    onClose: () => {
      console.log("Disconnected!")
    },
    onMessage: (e) => {
      const data = JSON.parse(e.data)
      switch (data.type) {
        case "chat_message":
          setMessages(prev => prev.concat(data.message))
          break
        default:
          console.log("Unknown message type!")
          break
      }
    }
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated"
  }[readyState];

  const onRoomClick = (id) => {
    setSocketUrl("ws://127.0.0.1:8000/rooms/" + id + "/")
    api.ansarClient.get_messages()
      .then((resp) => {
        selectRoom(id)
        setMessages(resp.data)
      })
      .catch((error) => {
        console.log('Error', error.message)
      })
  }

  const onSendMessage = () => {
    sendJsonMessage({
      type: "chat_message",
      message: messageText,
    })
  }

  const onSendFile = () => {
    //
  }

  if (!user.isAuthenticate) {
    return <Navigate to="/login" />
  }

  return (
    <div className="content">
      <h1>Ansar Chat</h1>
      <p className="info">{connectionStatus}</p>
      <p className="info">Current user: {user.username}</p>
      <div className={cls.main__panel}>
        <div className={cls.left__panel}>
          <RoomList
            items={rooms}
            onItemClick={onRoomClick}
          />
        </div>
        <div className={cls.right__panel}>
          <div className={cls.Room__panel}>
            <MessageList items={messages} />
          </div>
          <div className={cls.send__panel}>
            <Textarea
              rows="4"
              onChange={(e) => setMessageText(e.target.value)}
              value={messageText}>
            </Textarea>
            <div className={cls.button__panel}>
              <Button onClick={onSendFile}>Send File</Button>
              <Button onClick={onSendMessage}>Send Message</Button>
            </div>
          </div>
        </div>
      </div>
    </div>  
  )
}

export default MainPage