import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from '../../../api/index';
import { useAuth } from '../../../hooks/useAuth';
import ChatList from "../../UI/ChatList/ChatList";
import MessageList from "../../UI/MessageList/MessageList";
import Button from "../../UI/Button/Button";
import Textarea from "../../UI/Textarea/Textarea";

import cls from './MainPage.module.scss';



const MainPage = () => {
  const navigate = useNavigate();
  const { accessToken, userId, userFullname, onLogout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectItem, setSelectItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [messageType, setMessageType] = useState('chat');

  const createSocket = () => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat?token=${accessToken}`);
    
    socket.onmessage = function(e) {
      const data = JSON.parse(e.data);
      switch (data.category) {
        case "new_chat":
          setChats(prev => prev.concat(data.chat));
          break;
        
        case "change_chat":
          setChats(prev => {
            const index = prev.findIndex(item => item.id === data.chat.id);
            let new_arr = [...prev];
            new_arr.splice(index, 1, data.chat);
            return new_arr;
          });
          break;
        
        case "remove_chat":
          setChats(prev => {
            const index = prev.findIndex(item => item.id === data.chat_id);
            let new_arr = [...prev];
            new_arr.splice(index, 1);
            return new_arr;
          });
          break;

        case "new_message":
          if (data.message_type === "user") {
            setUsers(prev => {
              const index = prev.findIndex(item => (item.id === data.message.to_user || item.id === data.message.from_user));
              let new_arr = [...prev];
              new_arr[index].messages.push(data.message);
              return new_arr;
            });
          } else {
            setChats(prev => {
              const index = prev.findIndex(item => item.id === data.message.to_chat);
              let new_arr = [...prev];
              new_arr[index].messages.push(data.message);
              return new_arr;
            });
          };
          break;

        case "change_message":
          if (data.message_type === "user") {
            setUsers(prev => {
              const index = prev.findIndex(item => item.id === data.message.to_user);
              let new_arr = [...prev];
              const i = new_arr[index].messages.findIndex(item => item.id === data.message.id);
              new_arr[index].messages.splice(i, 1, data.message);
              return new_arr;
            });
          } else {
            setChats(prev => {
              const index = prev.findIndex(item => item.id === data.message.to_chat);
              let new_arr = [...prev];
              const i = new_arr[index].messages.findIndex(item => item.id === data.message.id);
              new_arr[index].messages.splice(i, 1, data.message);
              return new_arr;
            });
          };
          break;

        case "remove_message":
          if (data.message_type === "user") {
            setUsers(prev => {
              const index = prev.findIndex(item => item.id === data.message.to_user);
              let new_arr = [...prev];
                const i = new_arr[index].messages.findIndex(item => item.id === data.message.id);
                new_arr[index].messages.splice(i, 1);
                return new_arr;
            });
          } else {
            setChats(prev => {
              const index = prev.findIndex(item => item.id === data.message.to_chat);
              let new_arr = [...prev];
                const i = new_arr[index].messages.findIndex(item => item.id === data.message.id);
                new_arr[index].messages.splice(i, 1);
                return new_arr;
            });
          };
          break;  

        default:
          console.log("Unknown message type!")
          break;
      }
    };

    return socket;
  }
  
  useEffect(() => {
    setSocket(createSocket());
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
    // eslint-disable-next-line
  }, []);

  const handleItemClick = (item) => {
    setSelectItem(item);
    setMessages(item.messages);
  }

  const handleSendMessage = () => {
    const message = {
      message: "send_message",
      message_type: messageType,
      id: selectItem.id,
      text: text,
      filename: null
    }
     
    socket.send(JSON.stringify(message));

    setText('');
  }

  const handleSendFile = () => {
    let input = document.createElement('input');

    input.type = 'file';

    input.onchange = e => { 
      let file = e.target.files[0]; 
      let formData = new FormData();
      formData.append('file', file);
      api.ansarClient.upload_file(formData)
      .then((resp) => {
        const message = {
          message: "send_message",
          message_type: messageType,
          id: selectItem.id,
          text: null,
          filename: resp.data.filename
        }
         
        socket.send(JSON.stringify(message));
        setText('');
      })
      .catch((error) => {
        console.log('Error', error.message)
      }); 
    }

    input.click();
  }

  return (
    <div className="content">
      <h1>Ansar Chat</h1>
      <div className={cls.top__panel}>
        <p>Пользователь: {userFullname}</p>
        <Button onClick={() => onLogout(() => navigate('/login'))}>Выйти</Button>
      </div>
      <div className={cls.main__panel}>
        <div className={cls.left__panel}>
          <div className={cls.left__panel__toolbar}>
            <Button onClick={() => {setMessageType('chat'); setSelectItem(null)}}>Чаты</Button>
            <Button onClick={() => {setMessageType('user'); setSelectItem(null)}}>Пользователи</Button>
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              items={users}
              onItemClick={handleItemClick}
              is_visible={messageType === 'user'}
              selectItem={selectItem}
            />
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              items={chats}
              onItemClick={handleItemClick}
              is_visible={messageType === 'chat'}
              selectItem={selectItem}
            />
          </div>
        </div>  
        <div className={cls.right__panel}>
          <div className={cls.chat__panel}>
            <MessageList items={messages} userId={userId}/>
          </div>
          <div className={cls.send__panel}>
            <Textarea
              rows="4"
              onChange={(e) => setText(e.target.value)}
              value={text}>
            </Textarea>
            <div className={cls.button__panel}>
              <Button onClick={handleSendMessage}>Отправить сообщение</Button>
              <Button onClick={handleSendFile}>Отправить файл</Button>
            </div>
          </div>
        </div>
      </div>
    </div>  
  )
}

export default MainPage