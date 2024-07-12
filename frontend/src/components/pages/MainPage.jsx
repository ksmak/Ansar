import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from "html-to-draftjs";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";

import api from '../../api/index';
import PanelTop from "../UI/PanelTop";
import PanelLeft from "../UI/PanelLeft";
import PanelRight from "../UI/PanelRight";
import AlertSendFile from "../UI/AlertSendFile";
import AlertError from "../UI/AlertError";
import DialogEditMessage from "../UI/DialogEditMessage";
import DialogDeleteMessage from "../UI/DialogDeleteMessage";

const MainPage = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageType, setMessageType] = useState('chat');
  const [text, setText] = useState('');
  const [editText, setEditText] = useState('');
  const [countChatMsg, setCountChatMsg] = useState([]);
  const [countUserMsg, setCountUserMsg] = useState([]);
  const [selectItem, setSelectItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );
  const [editorEditState, setEditorEditState] = useState(
    () => EditorState.createEmpty(),
  );
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const userId = Number(sessionStorage.getItem('user_id'));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const calcUserCountMsg = () => {
    let result = {};
    let total = 0;
    users.length > 0 && users.forEach(item => {
      let messages = item.messages.filter(msg => msg.from_user !== userId && msg.to_user === userId && msg.readers.findIndex(reader => reader.user === userId) === -1);
      result = {
        ...result,
        [`user_${item.id}`]: messages.length,
      };
      total += messages.length;
    });
    result = {
      ...result,
      "total_count": total,
    }
    return result;
  };

  const calcChatCountMsg = () => {
    let result = {};
    let total = 0;
    chats.forEach(item => {
      let messages = item.messages.filter(msg => msg.from_user !== userId && msg.readers.findIndex(reader => reader.user === userId) === -1);
      result = {
        ...result,
        [`chat_${item.id}`]: messages.length,
      };
      total += messages.length;
    });
    result = {
      ...result,
      "total_count": total,
    }
    return result;
  };

  useEffect(() => {
    try {
      setSocket(createSocket());
    } catch (error) {
      setError("Error create socket!", error.message);
      navigate("/login");
    }
    api.ansarClient.get_users()
      .then((resp) => {
        setUsers(resp.data);
      })
      .catch((error) => {
        setError('Error get users!', error.message);
        navigate("/login");
      });

    api.ansarClient.get_chats()
      .then((resp) => {
        setChats(resp.data);
      })
      .catch((error) => {
        setError('Error get chats!', error.message);
        navigate("/login");
      });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chats, users]);

  useEffect(() => {
    if (chats.length > 0) setCountChatMsg(calcChatCountMsg());
    // eslint-disable-next-line
  }, [chats]);

  useEffect(() => {
    if (users.length > 0) setCountUserMsg(calcUserCountMsg());
    // eslint-disable-next-line
  }, [users]);

  const createSocket = () => {
    let accessToken = sessionStorage.getItem('access');
    const socket = new WebSocket(`${process.env.REACT_APP_WS_HOST}/ws/chat?token=${accessToken}`);
    socket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      switch (data.category) {
        case "change_chat":
          setUsers(prev => {
            let new_arr = [...prev];
            const index = prev.findIndex(item => item.id === data.online_user.user);
            if (index >= 0) {
              new_arr[index].online.is_active = data.online_user.is_active;
              new_arr[index].online.last_date = data.online_user.last_date;
            }
            return new_arr;
          });
          break;
        case "new_message":
          if (data.message_type === "user") {
            setUsers(prev => {
              let new_arr = [...prev];
              const index = prev.findIndex(item => (item.id === data.message.from_user || item.id === data.message.to_user));
              if (index >= 0) {
                const msg = new_arr[index].messages.find(item => item.id === data.message.id);
                if (!msg) {
                  new_arr[index].messages.push(data.message);
                }
              }
              return new_arr;
            });
          } else {
            setChats(prev => {
              let new_arr = [...prev];
              const index = prev.findIndex(item => item.id === data.message.to_chat);
              if (index >= 0) {
                const msg = new_arr[index].messages.find(item => item.id === data.message.id);
                if (!msg) {
                  new_arr[index].messages.push(data.message);
                }
              }
              return new_arr;
            });
          };
          break;
        case "change_message":
          if (data.message_type === "user") {
            setUsers(prev => {
              let new_arr = [...prev];
              const index = prev.findIndex(item => item.id === data.message.from_user || item.id === data.message.to_user);
              if (index >= 0) {
                const i = new_arr[index].messages.findIndex(item => item.id === data.message.id);
                if (i >= 0) {
                  new_arr[index].messages.splice(i, 1, data.message);
                }
              }
              return new_arr;
            });
          } else {
            setChats(prev => {
              let new_arr = [...prev];
              const index = prev.findIndex(item => item.id === data.message.to_chat);
              if (index >= 0) {
                const i = new_arr[index].messages.findIndex(item => item.id === data.message.id);
                if (i >= 0) {
                  new_arr[index].messages.splice(i, 1, data.message);
                }
              }
              return new_arr;
            });
          };
          break;
        default:
          setError("Unknown message type!")
          break;
      }
    };
    return socket;
  }

  const handleItemClick = (item) => {
    setSelectItem(item);
    setMessages(item.messages);
    let messages = [];
    if (messageType === 'user') {
      messages = item.messages.filter(msg => msg.from_user !== userId && msg.to_user === userId && msg.readers.findIndex(reader => reader.user === userId) === -1);
    } else {
      messages = item.messages.filter(msg => msg.from_user !== userId && msg.readers.findIndex(reader => reader.user === userId) === -1);
    }
    messages.forEach(item => {
      const message = {
        message: "read_message",
        message_type: messageType,
        message_id: item.id,
      }
      socket.send(JSON.stringify(message));
    })
  }

  const handleSendMessage = () => {
    if (!text) {
      return;
    }
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
    input.setAttribute('multiple', '');
    input.type = 'file';
    input.onchange = e => {
      let files = [...e.target.files];
      setFiles(files);
      files.forEach(file => {
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
            setFiles([]);
          })
          .catch((error) => {
            setError(error.message);
            setText('');
            setFiles([]);
          });
      });
    }
    input.click();
  }

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    const markup = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setText(markup);
  };

  const onEditorEditStateChange = (editorEditState) => {
    setEditorEditState(editorEditState);
    const markup = draftToHtml(convertToRaw(editorEditState.getCurrentContent()));
    setEditText(markup);
  }

  const handleOpenEditMessageDialog = (message_id) => {
    setEditItem(message_id);
    const msg = selectItem.messages.find(item => item.id === message_id);
    const blocksFromHtml = htmlToDraft(msg.text);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    setEditorEditState(EditorState.createWithContent(contentState));
  }

  const handleEditMessage = () => {
    const message = {
      message: "edit_message",
      message_type: messageType,
      message_id: editItem,
      text: editText,
    }
    socket.send(JSON.stringify(message));
    setEditText('');
    setEditorEditState(() => EditorState.createEmpty());
    setEditItem(null);
  };

  const handleOpenDeleteMessageDialog = (message_id) => {
    setDeleteItem(message_id);
  }

  const handleDeleteMessage = () => {
    const message = {
      message: "delete_message",
      message_type: messageType,
      message_id: deleteItem,
    }
    socket.send(JSON.stringify(message));
    setDeleteItem(null);
  }

  return (
    <div className="h-[calc(100vh-6rem)]">
      <AlertSendFile files={files} />
      <AlertError error={error} setError={setError} />
      <DialogEditMessage
        editItem={editItem}
        setEditItem={setEditItem}
        editorEditState={editorEditState}
        onEditorEditStateChange={onEditorEditStateChange}
        handleEditMessage={handleEditMessage}
      />
      <DialogDeleteMessage
        deleteItem={deleteItem}
        setDeleteItem={setDeleteItem}
        handleDeleteMessage={handleDeleteMessage}
      />
      <PanelTop />
      <div className="h-full flex flex-row justify-between">
        <PanelLeft
          messageType={messageType}
          setMessageType={setMessageType}
          selectItem={selectItem}
          setSelectItem={setSelectItem}
          handleItemClick={handleItemClick}
          countChatMsg={countChatMsg}
          countUserMsg={countUserMsg}
          chats={chats}
          users={users}
        />
        <PanelRight
          messages={messages}
          userId={userId}
          handleOpenEditMessageDialog={handleOpenEditMessageDialog}
          handleOpenDeleteMessageDialog={handleOpenDeleteMessageDialog}
          handleSendMessage={handleSendMessage}
          handleSendFile={handleSendFile}
          editorState={editorState}
          selectItem={selectItem}
          messagesEndRef={messagesEndRef}
          onEditorStateChange={onEditorStateChange}
        />
      </div>
    </div >
  )
}

export default MainPage;