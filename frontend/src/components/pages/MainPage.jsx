import React, { useEffect, useRef, useState } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from "html-to-draftjs";
import { v4 as uuidv4 } from 'uuid';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";

import { useAuth } from "../hooks/auth";
import api from '../../api/index';
import PanelTop from "../UI/PanelTop";
import PanelLeft from "../UI/PanelLeft";
import PanelRight from "../UI/PanelRight";
import AlertSend from "../UI/AlertSend";
import AlertError from "../UI/AlertError";
import DialogEditMessage from "../UI/DialogEditMessage";
import DialogDeleteMessage from "../UI/DialogDeleteMessage";
import DialogCall from "../UI/DialogCall";

export default function MainPage() {
  const { user } = useAuth();

  const [ws, setWs] = useState(null);

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

  const [sends, setSends] = useState([]);

  const [error, setError] = useState('');

  const [call, setCall] = useState(null);

  const [openVideoChat, setOpenVideoChat] = useState(false);

  const messagesEndRef = useRef(null);

  const localVideoRef = useRef(null);

  const remoteVideoRef = useRef(null);

  const constraints = { 'video': true, 'audio': true };

  const configuration = { iceServers: [{ urls: 'stun:stun.example.org' }] };

  const pc = new RTCPeerConnection(configuration);


  useEffect(() => {
    createWebSocket(ws);

    api.ansarClient.get_users()
      .then((resp) => {
        setUsers(resp.data);
      })

      .catch((error) => {
        setError('Error get users!', error.message);
      });

    api.ansarClient.get_chats()
      .then((resp) => {
        setChats(resp.data);
      })

      .catch((error) => {
        setError('Error get chats!', error.message);
      });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chats, users]);

  useEffect(() => {
    if (chats.length > 0) setCountChatMsg(calcChatCountMsg(chats));
    // eslint-disable-next-line
  }, [chats]);

  useEffect(() => {
    if (users.length > 0) setCountUserMsg(calcUserCountMsg(users));
    // eslint-disable-next-line
  }, [users]);

  useEffect(() => {
    if (openVideoChat) startPeerConnection();
    // eslint-disable-next-line
  }, [openVideoChat]);

  function createWebSocket() {
    let accessToken = sessionStorage.getItem('access');

    const ws = new WebSocket(`${process.env.REACT_APP_WS_HOST}/ws/chat/?token=${accessToken}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      switch (data.category) {
        case "call":
          setChatCall(data);
          break;

        case "cancel":
          setChatCancel();
          break;

        case "accept":
          setChatAccept(data);
          break;

        case "offer":
          console.log(`offer: ${data}`);
          setChatOffer(data);
          break;

        case "answer":
          console.log(`answer: ${data}`);
          setChatAnswer(data);
          break;

        case "candidate":
          console.log(`candidate: ${data}`);
          setChatCandidate(data);
          break;

        case "change_chat":
          setChatChange(data);
          break;

        case "new_message":
          setChatNewMessage(data);
          break;

        case "change_message":
          setChatChangeMessage(data);
          break;

        default:
          setError("Unknown message type!");
          break;
      }
    }

    setWs(ws);
  }

  function setChatCall(data) {
    setCall(data);
  };

  function setChatCancel() {
    setCall(null);
  };

  function setChatAccept(data) {
    if (data.message_type === "user" || data.from_id === user.id) {
      setOpenVideoChat(true);
    }
  };

  function setChatOffer(data) {
    const pc = new RTCPeerConnection(configuration);

    pc.addEventListener('onicecandidate', (event) => {
      if (event.candidate) {
        ws.send({
          "message": "send_candidate",
          "message_type": call.messsage_type,
          "to_id": call.to_id,
          "desc": event.candidate,
        });
      }
    });

    pc.addEventListener('onnegotiationneeded', () => {
      pc.createOffer()
        .then((offer) => {
          pc.setLocalDescription(offer)
            .then(() => {
              ws.send({
                "message": "send_offer",
                "message_type": call.messsage_type,
                "to_id": call.to_id,
                "desc": pc.localDescription,
              });
            })
            .catch(e => setError("Error setting local description: " + e.message));
        })
        .catch(e => setError("Error creating offer: " + e.message));
    });

    pc.setRemoteDescription(data.desc)
      .then(() => {
        let stream = new MediaStream();

        stream.getTracks().forEach((track) =>
          pc.addTrack(track, stream));

        remoteVideoRef.current.srcObject = stream;

        pc.createAnswer()
          .then(answer => {
            pc.setLocalDescription(answer)
              .then(() => {
                ws.send({
                  "message": "send_answer",
                  "message_type": data.messsage_type,
                  "to_id": data.to_id,
                  "desc": pc.localDescription,
                });
              })
          })
          .catch(e => setError("Error creating answer: " + e.message));
      })
      .catch(e => setError("Error setting remote description: " + e.message));
  };

  function setChatAnswer(data) {
    pc.setRemoteDescription(data.desc)
      .catch(e => setError("Error setting answer: " + e.message));
  };

  function setChatCandidate(data) {
    pc.addIceCandidate(data.desc)
      .catch(e => setError("Error setting candidate: " + e.message));
  };

  function setChatChange(data) {
    setUsers(prev => {
      let new_arr = prev.map(item => ({ ...item }));

      const index = prev.findIndex(item =>
        item.id === data.online_user.user
      );

      if (index >= 0) {
        new_arr[index].online.is_active = data.online_user.is_active;
        new_arr[index].online.last_date = data.online_user.last_date;
      }

      return new_arr;
    });
  };

  function setChatNewMessage(data) {
    setSends(prev => prev.filter(item => item.uuid !== data.uuid));

    if (data.message_type === "user") {
      setUsers(prev => {
        let new_arr = prev.map(item => ({ ...item }));

        const index = prev.findIndex(item =>
          item.id === data.message.from_user || item.id === data.message.to_user
        );

        if (index >= 0) {
          const message = new_arr[index].messages.find(message =>
            message.id === data.message.id
          );

          if (!message) {
            new_arr[index].messages.push(data.message);
          }
        }

        return new_arr;
      });

    } else {
      setChats(prev => {
        let new_arr = prev.map(item => ({ ...item }));

        const index = prev.findIndex(item =>
          item.id === data.message.to_chat
        );

        if (index >= 0) {
          const message = new_arr[index].messages.find(message =>
            message.id === data.message.id
          );

          if (!message) {
            new_arr[index].messages.push(data.message);
          }
        }

        return new_arr;
      });
    };

  };

  function setChatChangeMessage(data) {
    if (data.message_type === "user") {
      setUsers(prev => {
        let new_arr = prev.map(item => ({ ...item }));

        const index = prev.findIndex(item =>
          item.id === data.message.from_user || item.id === data.message.to_user
        );

        if (index >= 0) {
          const messageIndex = new_arr[index].messages.findIndex(message =>
            message.id === data.message.id
          );

          if (messageIndex >= 0) {
            new_arr[index].messages[messageIndex] = data.message;
          }
        }

        return new_arr;
      });
    } else {
      setChats(prev => {
        let new_arr = prev.map(item => ({ ...item }));

        const index = prev.findIndex(item =>
          item.id === data.message.to_chat
        );

        if (index >= 0) {
          const messageIndex = new_arr[index].messages.findIndex(item =>
            item.id === data.message.id
          );

          if (messageIndex >= 0) {
            new_arr[index].messages[messageIndex] = data.message;
          }
        }

        return new_arr;
      });
    }
  };

  function startPeerConnection() {
    pc.addEventListener('onicecandidate', (event) => {
      if (event.candidate) {
        ws.send({
          "message": "send_candidate",
          "message_type": call.messsage_type,
          "to_id": call.to_id,
          "desc": event.candidate,
        });
      }
    });

    pc.addEventListener('onnegotiationneeded', () => {
      pc.createOffer()
        .then((offer) => {
          pc.setLocalDescription(offer)
            .then(() => {
              ws.send({
                "message": "send_offer",
                "message_type": call.messsage_type,
                "to_id": call.to_id,
                "desc": pc.localDescription,
              });
            })
            .catch(e => setError("Error setting local description: " + e.message));
        })
        .catch(e => setError("Error creating offer: " + e.message));
    });

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        stream.getTracks().forEach(track => pc.addTrack(track));
        localVideoRef.current.srcObject = stream;
      })
      .catch(e => setError("Error accessing media devices: " + e.message));
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const calcUserCountMsg = (users) => {
    let result = {};

    let total = 0;

    users.length > 0 && users.forEach(item => {
      let messages = item.messages.filter(msg =>
        msg.from_user !== user.id
        && msg.to_user === user.id
        && msg.readers.findIndex(reader => reader.id === user.id) === -1
      );

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

  const calcChatCountMsg = (chats) => {
    let result = {};

    let total = 0;

    chats.forEach(item => {
      let messages = item.messages.filter(msg =>
        msg.from_user !== user.id
        && msg.readers.findIndex(reader => reader.id === user.id) === -1
      );

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

  function handleItemClick(item) {
    setSelectItem(item);

    setMessages(item.messages);

    let unread_messages = item.messages.filter(msg =>
      msg.from_user !== user.id
      && msg.readers.findIndex(reader => reader.id === user.id) === -1
    );

    unread_messages.forEach(msg => {
      ws.send(JSON.stringify({
        message: "read_message",
        message_type: messageType,
        message_id: msg.id,
      }));
    });
  }

  function handleSendMessage() {
    if (!text) {
      return;
    }

    let message_id = uuidv4();

    setSends(prev =>
      prev.concat({
        message_id: message_id,
        title: `Отправка сообщения "${text.substring(0, 20)}..." в "${selectItem.title || selectItem.full_name}" ...`
      }
      ));

    ws.send(JSON.stringify({
      message: "send_message",
      message_type: messageType,
      to_id: selectItem.id,
      text: text,
      file: null,
      message_id: message_id,
    }));

    setText('');

    setEditorState(() => EditorState.createEmpty());
  }

  function handleSendFile() {
    let input = document.createElement('input');

    input.setAttribute('multiple', '');

    input.type = 'file';

    input.onchange = (e) => {
      let files = [...e.target.files];

      let file_data = [];

      for (const file of files) {
        file_data.push({
          'file': file,
          'message_id': uuidv4(),
        });
      }

      file_data.forEach(async (f) => {
        let formData = new FormData();

        formData.append('file', f.file);

        setSends(prev =>
          prev.concat({
            message_id: f.message_id,
            title: `Отправка файла "${f.file.name}" в "${selectItem.title || selectItem.full_name}" ...`
          }
          ));

        try {
          const response = await api.ansarClient.upload_file(formData);

          ws.send(JSON.stringify({
            message: "send_message",
            message_type: messageType,
            to_id: selectItem.id,
            text: null,
            file: response.data.filename,
            message_id: f.message_id,
          }));

          setError('');

          setText('');

        } catch (error) {
          setError(error.message);

          setText('');
        }
      });
    }

    input.click();
  }

  function handleCallVideoChat() {
    ws.send(JSON.stringify({
      message: "send_call",
      message_type: messageType,
      to_id: selectItem.id,
    }));
  }

  function handleCancelCallVideoChat() {
    ws.send(JSON.stringify({
      message: "send_cancel",
      message_type: call.message_type,
      to_id: call.to_id,
    }));
  }

  function handleAcceptCallVideoChat() {
    ws.send(JSON.stringify({
      message: "send_accept",
      message_type: call.message_type,
      to_id: call.to_id,
    }));
  }

  function onEditorStateChange(editorState) {
    setEditorState(editorState);

    const markup = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );

    setText(markup);
  };

  function onEditorEditStateChange(editorEditState) {
    setEditorEditState(editorEditState);

    const markup = draftToHtml(
      convertToRaw(editorEditState.getCurrentContent())
    );

    setEditText(markup);
  }

  function handleOpenEditMessageDialog(message_id) {
    setEditItem(message_id);

    const message = selectItem.messages.find(msg => msg.id === message_id);

    const blocksFromHtml = htmlToDraft(message.text);

    const { contentBlocks, entityMap } = blocksFromHtml;

    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);

    setEditorEditState(EditorState.createWithContent(contentState));
  }

  function handleEditMessage() {
    ws.send(JSON.stringify({
      message: "edit_message",
      message_type: messageType,
      message_id: editItem,
      text: editText,
    }));

    setEditText('');

    setEditorEditState(() => EditorState.createEmpty());

    setEditItem(null);
  };

  function handleOpenDeleteMessageDialog(message_id) {
    setDeleteItem(message_id);
  }

  function handleDeleteMessage() {
    ws.send(JSON.stringify({
      message: "delete_message",
      message_type: messageType,
      message_id: deleteItem,
    }));

    setDeleteItem(null);
  }

  return (
    <div>
      {openVideoChat
        ? <div className="h-screen w-full bg-black">
          Video Chat
          <div className="flex flex-row justify-between">
            <video
              className="grow"
              ref={localVideoRef} autoPlay
            />
            <video
              className="grow"
              ref={remoteVideoRef} autoPlay
            />
          </div>
        </div>
        : <div className="h-[calc(100vh-6rem)]">
          <div className="absolute opacity-55 w-full flex flex-col gap-1">
            {sends && sends.map(send => (
              <AlertSend key={send.message_id} title={send.title} />
            ))}
          </div>
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
          <DialogCall
            userId={user.id}
            call={call}
            handleAcceptCallVideoChat={handleAcceptCallVideoChat}
            handleCancelCallVideoChat={handleCancelCallVideoChat}
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
              userId={user.id}
              handleOpenEditMessageDialog={handleOpenEditMessageDialog}
              handleOpenDeleteMessageDialog={handleOpenDeleteMessageDialog}
              handleSendMessage={handleSendMessage}
              handleSendFile={handleSendFile}
              handleCallVideoChat={handleCallVideoChat}
              editorState={editorState}
              selectItem={selectItem}
              messagesEndRef={messagesEndRef}
              onEditorStateChange={onEditorStateChange}
              messageType={messageType}
            />
          </div>
        </div>}
    </div>
  )
}
