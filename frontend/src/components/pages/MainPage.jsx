import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from '../../api/index';
import { useAuth } from '../../hooks/useAuth';
import ChatList from "../UI/ChatList";
import MessageList from "../UI/MessageList";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";

import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import { Alert, Spinner, Typography } from "@material-tailwind/react";

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
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
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
              const index = prev.findIndex(item => (item.id === data.message.to_user));
              let new_arr = [...prev];
              const msg = new_arr[index].messages.find(item => item.id === data.message.id);
              if (!msg) {
                new_arr[index].messages.push(data.message);
              }
              return new_arr;
            });
          } else {
            setChats(prev => {
              const index = prev.findIndex(item => item.id === data.message.to_chat);
              let new_arr = [...prev];
              const msg = new_arr[index].messages.find(item => item.id === data.message.id);
              if (!msg) {
                new_arr[index].messages.push(data.message);
              }
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
      setFilename(file.name);
      let formData = new FormData();
      formData.append('file', file);
      api.ansarClient.upload_file(formData)
        .then((resp) => {
          const message = {
            message: "send_message",
            message_type: messageType,
            id: selectItem.id,
            text: null,
            filename: resp.data.filename,
          }
          socket.send(JSON.stringify(message));
          setError('');
          setText('');
          setFilename('');
        })
        .catch((error) => {
          console.log('Error', error.message);
          setError(error.message);
          setText('');
          setFilename('');
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
    <div className="h-[calc(100vh-6rem)]">
      <div className="absolute opacity-55 w-full">
        <Alert color="blue-gray" open={filename !== ''}>
          <Typography className="font-medium flex flex-row justify-between items-center gap-10">
            Отправка файла {filename} ...
            <Spinner className="h-8 w-8" />
          </Typography>
        </Alert>
      </div>
      <div className="absolute w-full">
        <Alert color="red" open={error !== ''} onClose={() => setError('')}>
          <Typography className="font-medium">
            {error}
          </Typography>
        </Alert>
      </div>
      <div className="h-24 bg-white flex flex-row justify-between border-blue-gray-900 border-b-2">
        <img className="h-20 pl-10 self-center" src="ansar.png" alt="ansar" />
        <div className="flex flex-row gap-2 self-end pr-4 pb-2 font-mono text-black">
          <p>Пользователь: <span className="text-primary font-bold underline">{userFullname}</span></p>
          <button className="font-mono p-1 rounded bg-blue-gray-400 text-xs text-white" onClick={() => onLogout(() => navigate('/login'))}>Выйти</button>
        </div>
      </div>
      <div className="h-full bg-white flex flex-row justify-between">
        <div className="h-full w-1/4 border-r-2 border-blue-gray-900">
          <div className="flex flex-row justify-between p-4">
            <p className="text-primary underline hover:cursor-pointer font-bold" onClick={() => { setMessageType('chat'); setSelectItem(null) }}>Группы</p>
            <p className="text-primary underline hover:cursor-pointer font-bold" onClick={() => { setMessageType('user'); setSelectItem(null) }}>Пользователи</p>
          </div>
          <div>
            <ChatList
              chat_type="user"
              items={users}
              onItemClick={handleItemClick}
              is_visible={messageType === 'user'}
              selectItem={selectItem}
            />
          </div>
          <div>
            <ChatList
              chat_type="chat"
              items={chats}
              onItemClick={handleItemClick}
              is_visible={messageType === 'chat'}
              selectItem={selectItem}
            />
          </div>
        </div>
        <div className="h-full w-3/4">
          <div className="h-3/4 overflow-auto">
            {selectItem
              ? <MessageList items={messages} userId={userId} />
              : null}
            <div ref={messagesEndRef} />
          </div>
          <div className="h-1/4">
            {selectItem
              ? <div>
                <Editor
                  editorStyle={{ height: '5rem' }}
                  editorState={editorState}
                  toolbarClassName="toolbar-class"
                  wrapperClassName="wrapper-class"
                  editorClassName="editor-class"
                  onEditorStateChange={onEditorStateChange}
                />
                <div className="flex flex-row gap-5 p-1">
                  <button className="p-1 bg-formbgcolor text-white border-2 border-gray-300 rounded-md" onClick={handleSendMessage}>Отправить сообщение</button>
                  <button className="p-1 bg-formbgcolor text-white border-2 border-gray-300 rounded-md" onClick={handleSendFile}>Отправить файл</button>
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