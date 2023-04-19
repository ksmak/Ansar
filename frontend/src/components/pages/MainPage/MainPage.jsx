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
  const [selectItem, setSelectItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [panel, setPanel] = useState('chats');

  const chatSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat?token=${localStorage.getItem('access')}`);
  chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    switch (data.type) {
      case "new_chat":
        const sc = createSocket(`ws://127.0.0.1:8000/ws/group?token=${localStorage.getItem('access')}`)
        const obj = {
          socket: sc,
          item: data.chat
        }
        setChats(prev => prev.concat(obj));
        break;
      case "change_chat":
        setChats(prev => {
          const index = prev.findIndex(item => item.item.id === data.chat.id);
          let new_arr = [...prev];
          const obj = {
            socket: prev[index].socket,
            item: data.chat
          }
          new_arr.splice(index, 1, obj);
          return new_arr;
        });
        break;
      case "remove_chat":
        setChats(prev => {
          const index = prev.findIndex(item => item.item.id === data.chat_id);
          let new_arr = [...prev];
          new_arr.splice(index, 1);
          return new_arr;
        });
        break;
      default:
        console.log("Unknown message type!")
        break;
    }
  };
  
  const createSocket = (url) => {
    const socket = new WebSocket(url);
    socket.onmessage = function(e) {
      let data = JSON.parse(e.data);
      switch (data.type) {
        case "new_message":
          if (data.message_type === "user") {
            setUsers(prev => {
              const index = prev.findIndex(el => el.item.id === data.message.user);
              let new_arr = [...prev];
              new_arr[index].item.messages.push(data.message);
              return new_arr;
            });
          } else {
            setChats(prev => {
              const index = prev.findIndex(el => el.item.id === data.message.chat);
              let new_arr = [...prev];
              new_arr[index].item.messages.push(data.message);
              return new_arr;
            });
          };
          break;
        case "change_message":
          if (data.message_type === "user") {
            setUsers(prev => {
              const index = prev.findIndex(item => item.item.id === data.message.user);
              let new_arr = [...prev];
              const i = new_arr[index].item.messages.findIndex(item => item.id === data.message.id);
              new_arr[index].item.messages.splice(i, 1, data.message);
              return new_arr;
            });
          } else {
            setChats(prev => {
              const index = prev.findIndex(item => item.item.id === data.message.chat);
              let new_arr = [...prev];
              const i = new_arr[index].item.messages.findIndex(item => item.id === data.message.id);
              new_arr[index].item.messages.splice(i, 1, data.message);
              return new_arr;
            });
          };
        break;
      case "remove_message":
        if (data.message_type === "user") {
          setUsers(prev => {
            const index = prev.findIndex(item => item.item.id === data.message.user);
            let new_arr = [...prev];
              const i = new_arr[index].item.messages.findIndex(item => item.id === data.message.id);
              new_arr[index].item.messages.splice(i, 1);
              return new_arr;
          });
        } else {
          setChats(prev => {
            const index = prev.findIndex(item => item.item.id === data.message.chat);
            let new_arr = [...prev];
              const i = new_arr[index].item.messages.findIndex(item => item.id === data.message.id);
              new_arr[index].item.messages.splice(i, 1);
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
  };
  
  useEffect(() => {
    api.ansarClient.get_users()
      .then((resp) => {
        let arr = []
        resp.data.forEach(user => {
          const sc = createSocket(`ws://127.0.0.1:8000/ws/message/user/${user.id}?token=${localStorage.getItem('access')}`);
          let obj = {
            socket: sc,
            item: user
          };
          arr.push(obj);
        });
        setUsers(arr);
      })
      .catch((error) => {
        console.log('Error', error.message)
      });
    api.ansarClient.get_chats()
      .then((resp) => {
        let arr = []
        resp.data.forEach(chat => {
          const sc = createSocket(`ws://127.0.0.1:8000/ws/message/group/${chat.id}?token=${localStorage.getItem('access')}`);
          let obj = {
            socket: sc,
            item: chat
          };
          arr.push(obj);
        });
        setChats(arr);
      })
      .catch((error) => {
        console.log('Error', error.message)
      });
  }, [])

  const handleItemClick = (item) => {
    setSelectItem(item);
    setMessages(item.item.messages);
  }

  const handleSendMessage = () => {
    const message = {
      message: "send_message",
      text: text,
      file_path: null
    }
     
    selectItem.socket.send(JSON.stringify(message));

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
          text: "#file#",
          file_path: resp.data.file_url
        }
         
        selectItem.socket.send(JSON.stringify(message));

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
      <p>{localStorage.getItem('full_name')}</p>
      <div className={cls.main__panel}>
        <div className={cls.left__panel}>
          <div className={cls.left__panel__toolbar}>
            <Button onClick={() => {setPanel('chats'); setSelectItem(null)}}>Чаты</Button>
            <Button onClick={() => {setPanel('users'); setSelectItem(null)}}>Пользователи</Button>
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              items={users}
              onItemClick={handleItemClick}
              is_visible={panel === 'users'}
              selectItem={selectItem}
            />
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              items={chats}
              onItemClick={handleItemClick}
              is_visible={panel === 'chats'}
              selectItem={selectItem}
            />
          </div>
        </div>  
        <div className={cls.right__panel}>
          <div className={cls.chat__panel}>
            <MessageList items={messages} user_id={localStorage.getItem('user')}/>
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