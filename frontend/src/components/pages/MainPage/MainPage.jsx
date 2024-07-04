import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from '../../../api/index';
import { useAuth } from '../../../hooks/useAuth';
import ChatList from "../../UI/ChatList/ChatList";
import MessageList from "../../UI/MessageList/MessageList";
import Button from "../../UI/Button/Button";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";
import cls from './MainPage.module.scss';

import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

const MainPage = () => {
  const navigate = useNavigate();
  const { onLogout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectItem, setSelectItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [messageType, setMessageType] = useState('chat');
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );
  const userFullname = sessionStorage.getItem('user_fullname');
  const userId = Number(sessionStorage.getItem('user_id'));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chats, users]);

  const createSocket = () => {
    let accessToken = sessionStorage.getItem('access');
    const socket = new WebSocket(`${process.env.REACT_APP_WS_HOST}/ws/chat?token=${accessToken}`);

    socket.onmessage = function (e) {
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
    try {
      setSocket(createSocket());
    } catch (error) {
      console.log("Error create socket!");
      navigate("/login");
    }
    api.ansarClient.get_users()
      .then((resp) => {
        setUsers(resp.data);
      })
      .catch((error) => {
        console.log('Error get users!', error.message);
        navigate("/login");
      });

    api.ansarClient.get_chats()
      .then((resp) => {
        setChats(resp.data);
      })
      .catch((error) => {
        console.log('Error get chats!', error.message);
        navigate("/login");
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
    setEditorState(() => EditorState.createEmpty());
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

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    const markup = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setText(markup);
  };

  return (
    <div>
      <div className={cls.top__panel}>
        <img src="ansar.png" alt="ansar" />
        <div className={cls.user_info_panel}>
          <p>Пользователь: <span>{userFullname}</span></p>
          <button onClick={() => onLogout(() => navigate('/login'))}>Выйти</button>
        </div>
      </div>
      <div className={cls.main__panel}>
        <div className={cls.left__panel}>
          <div className={cls.left__panel__toolbar}>
            <p onClick={() => { setMessageType('chat'); setSelectItem(null) }} className={messageType === "chat" ? cls.active_item : ""}>Группы</p>
            <p onClick={() => { setMessageType('user'); setSelectItem(null) }} className={messageType === "user" ? cls.active_item : ""}>Пользователи</p>
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              chat_type="user"
              items={users}
              onItemClick={handleItemClick}
              is_visible={messageType === 'user'}
              selectItem={selectItem}
            />
          </div>
          <div className={cls.left__panel__list}>
            <ChatList
              chat_type="chat"
              items={chats}
              onItemClick={handleItemClick}
              is_visible={messageType === 'chat'}
              selectItem={selectItem}
            />
          </div>
        </div>
        <div className={cls.right__panel}>
          <div className={cls.chat__panel}>
            {selectItem
              ? <MessageList items={messages} userId={userId} />
              : null}
            <div ref={messagesEndRef} />
          </div>
          <div className={cls.send__panel}>
            {selectItem
              ? <div>
                <Editor
                  editorState={editorState}
                  toolbarClassName="toolbar-class"
                  wrapperClassName="wrapper-class"
                  editorClassName="editor-class"
                  onEditorStateChange={onEditorStateChange} />
                <div className={cls.button__panel}>
                  <Button onClick={handleSendMessage}>Отправить сообщение</Button>
                  <Button onClick={handleSendFile}>Отправить файл</Button>
                </div>
              </div>
              : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage