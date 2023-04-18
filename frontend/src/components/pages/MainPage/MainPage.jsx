// React, Redux, WebSocket
import React, { useEffect, useState } from "react";

// Project
import api from '../../../api/index';

// Components
import ChatList from "../../UI/ChatList/ChatList";
import MessageList from "../../UI/MessageList/MessageList";
import Button from "../../UI/Button/Button";
import Textarea from "../../UI/Textarea/Textarea";

// CSS
import cls from './MainPage.module.scss';


const MainPage = () => {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [select, setSelect] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [panel, setPanel] = useState('chats');
  const [chatSocketState, setChatSocketState] = useState('');
  const [msgSocket, setMsgSocket] = useState(null);
  const [msgSocketState, setMsgSocketState] = useState('');
  const access_token = localStorage.getItem('access');
  const user = localStorage.getItem('user');

  const chatSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat?token=${access_token}`);
  
  chatSocket.onopen = function(e) {
    setChatSocketState('open');
  };
  
  chatSocket.onmessage = function(e) {
    setChatSocketState('message');
    let message = JSON.parse(e.data);
    switch (message.type) {
      case "new_chat":
        setChats(prev => prev.concat(message.chat));
        break;
      case "change_chat":
        setChats(prev => {
          let index = prev.findIndex(item => item.id === message.chat.id);
          prev.splice(index, 1, message.chat);
          return prev;
        });
        break;
      case "remove_chat":
        setChats(prev => {
          let index = prev.findIndex(item => item.id === message.chat_id);
          prev.splice(index, 1);
          return prev;
        });
        break;
      default:
        console.log("Unknown message type!")
        break;
    }
  };
  
  chatSocket.onclose = function(event) {
    setChatSocketState('close');
  };
  
  chatSocket.onerror = function(error) {
    setChatSocketState('error');
  };

  const createMessageSocket = (url) => {
    const socket = new WebSocket(url);
    
    socket.onopen = function(e) {
      setMsgSocketState('open');
    };
    
    socket.onmessage = function(e) {
      setMsgSocketState('message');
      let data = JSON.parse(e.data);
      switch (data.type) {
        case "new_message":
          setChats(prev => {
            let index = prev.findIndex(item => item.id == data.message.chat);
            let obj = {... prev[index] }
            obj.messages.push(data.message);
            prev.splice(index, 1, obj);
            return prev
          })
          break;
        case "change_message":
          setChats(prev => {
            let index = prev.findIndex(item => item.id == data.message.chat);
            let obj = {... prev[index]};
            let i = obj.messages.findIndex(item => item.id == data.message.id);
            obj.messages.splice(i, 1, data.message);
            prev.splice(index, 1, obj);
            return prev;
          });
        break;
      case "remove_message":
        setChats(prev => {
          let index = prev.findIndex(item => item.id == data.message.chat);
          let obj = {... prev[index]};
          let i = obj.messages.findIndex(item => item.id == data.message.id);
          obj.messages.splice(i, 1);
          prev.splice(index, 1, obj);
          return prev;
        });
        break;
      default:
        console.log("Unknown message type!")
        break;
      }
    };
    
    socket.onclose = function(event) {
      setMsgSocketState('close');
    };
    
    socket.onerror = function(error) {
      setMsgSocketState('error');
    };

    return socket;
  }

  useEffect(() => {
    api.ansarClient.get_users()
      .then((resp) => {
        setUsers(resp.data);
      })
      .catch((error) => {
        console.log('Error', error.message)
      });
    api.ansarClient.get_chats()
      .then((resp) => {
        setChats(resp.data);
      })
      .catch((error) => {
        console.log('Error', error.message)
      });
  }, [])

  const handleClickChat = (item) => {
    setSelect(item);
    setMsgSocket(createMessageSocket(`ws://127.0.0.1:8000/ws/messages/${item.id}?token=${access_token}`));
    setMessages(item.messages);
  }
  
  const handleSendText = () => {
    console.log('run send text')
    let message = {
      message: "send_message",
      text: text,
      file_path: null
    }
    msgSocket.send(JSON.stringify(message));
  }

  const handleSendFile = () => {
    //
  }

  return (
    <div className="content">
      <h1>Ansar Chat</h1>
      <div className={cls.main__panel}>
        <div className={cls.left__panel}>
          <div className={cls.left__panel__toolbar}>
            <Button onClick={() => {setPanel('chats'); setSelect(null)}}>Чаты</Button>
            <Button onClick={() => {setPanel('users'); setSelect(null)}}>Пользователи</Button>
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              items={users}
              onItemClick={handleClickChat}
              is_visible={panel == 'users'}
              selectItem={select}
            />
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              items={chats}
              onItemClick={handleClickChat}
              is_visible={panel == 'chats'}
              selectItem={select}
            />
          </div>
        </div>  
        <div className={cls.right__panel}>
          <div className={cls.chat__panel}>
            <MessageList items={messages} user_id={user.id}/>
          </div>
          <div className={cls.send__panel}>
            <Textarea
              rows="4"
              onChange={(e) => setText(e.target.value)}
              value={text}>
            </Textarea>
            <div className={cls.button__panel}>
              <Button onClick={handleSendText}>Send File</Button>
              <Button onClick={handleSendFile}>Send Message</Button>
            </div>
          </div>
        </div>
      </div>
    </div>  
  )
}

export default MainPage