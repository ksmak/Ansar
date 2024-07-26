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
import VideoChat from "../UI/VideoChat";

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

  const [pc, setPc] = useState(null);

  const [remoteCount, setRemoteCount] = useState(1);

  const [openVideoChat, setOpenVideoChat] = useState(false);

  const [audioMute, setAudioMute] = useState(false);

  const [videoMute, setVideoMute] = useState(false);

  const [localStream, setLocalStream] = useState(null);

  const messagesEndRef = useRef(null);

  const localVideoRef = useRef(null);

  const constraints = { 'video': true, 'audio': true };

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
    if (openVideoChat) setPc(new RTCPeerConnection());
    // eslint-disable-next-line
  }, [openVideoChat]);

  useEffect(() => {
    if (pc) startPeerConnection();
  }, [pc])

  useEffect(() => {
    if (chats.length > 0) setCountChatMsg(calcChatCountMsg(chats));
    // eslint-disable-next-line
  }, [chats]);

  useEffect(() => {
    if (users.length > 0) setCountUserMsg(calcUserCountMsg(users));
    // eslint-disable-next-line
  }, [users]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chats, users]);

  useEffect(() => {
    resizeVideoContainer();
  }, [remoteCount]);

  useEffect(() => {
    if (localStream) {
      let audioTracks = localStream.getAudioTracks();
      audioTracks[0].enabled = !audioMute;
    }
  }, [audioMute]);

  useEffect(() => {
    if (localStream) {
      let videoTracks = localStream.getVideoTracks();
      videoTracks[0].enabled = !videoMute;
    }
  }, [videoMute]);

  function createWebSocket() {
    let accessToken = sessionStorage.getItem('access');

    const ws = new WebSocket(`${process.env.REACT_APP_WS_HOST}/ws/chat?token=${accessToken}`);

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
          setChatOffer(data, ws);
          break;

        case "answer":
          setChatAnswer(data);
          break;

        case "candidate":
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

  function startPeerConnection() {
    console.log('start startPeerConnection.');
    pc.onicecandidate = (event) => {
      console.log('event onicecandidate.');
      if (event.candidate) {
        ws.send(JSON.stringify({
          "message": "send_candidate",
          "message_type": call.message_type,
          "to_id": call.to_id,
          "desc": event.candidate,
        }));
        console.log('signal: send_candidate sended.');
      };
    }

    if (call.from_id === user.id) {
      console.log(`set event onnegotioationneeded.`);
      pc.onnegotiationneeded = () => {
        pc.createOffer()
          .then(offer => {
            console.log('offer created.');
            pc.setLocalDescription(offer)
              .then(() => {
                console.log('local description setted.');
                ws.send(JSON.stringify({
                  "message": "send_offer",
                  "message_type": call.message_type,
                  "to_id": call.to_id,
                  "desc": pc.localDescription,
                }));
                console.log('signal: send_offer sended.');
              })
          })
      };
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'closed' || pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        if (pc.iceConnectionState !== 'closed')
          pc.close();

        removeRemoteVideo(call.to_id);
      }
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        localVideoRef.current.srcObject = stream;

        setLocalStream(stream);
      });

    createRemoteVideo(call.to_id);
  }

  function createRemoteVideo(video_id) {
    let remoteStream = new MediaStream();

    let remoteVideoContainer = document.getElementById('video-container');

    let video = document.createElement('video');
    video.className = 'h-full w-full object-cover';
    video.autoplay = true;
    video.srcObject = remoteStream;

    let videoWraper = document.createElement('div');
    videoWraper.id = video_id;
    videoWraper.className = 'h-full w-full grow';

    remoteVideoContainer.appendChild(videoWraper);

    videoWraper.appendChild(video);

    setRemoteCount(remoteVideoContainer.childElementCount);

    pc.ontrack = (event) => {
      remoteStream.addTrack(event.track);
    };
  }

  function removeRemoteVideo(video_id) {
    let remoteVideoContainer = document.getElementById('video-container');

    let videoWraper = document.getElementById(video_id);

    remoteVideoContainer.removeChild(videoWraper);

    setRemoteCount(remoteVideoContainer.childElementCount);
  }

  function setChatCall(data) {
    setCall(data);
  };

  function setChatCancel() {
    setCall(null);
  };

  function setChatAccept(data) {
    if (data.message_type === "user" || data.from_id === user.id) {
      setCall(data);
      setOpenVideoChat(true);
    }
  };

  function resizeVideoContainer() {
    let remoteVideoContainer = document.getElementById('video-container');

    if (!remoteVideoContainer) return;

    switch (remoteVideoContainer.childElementCount) {
      case 1:
      case 2:
      case 3:
        remoteVideoContainer.className = 'h-full w-full gap-1 flex flex-row';
        break;
      case 4:
        remoteVideoContainer.className = 'h-full w-full gap-1 grid grid-cols-2 grid-rows-2';
        break;
      case 5:
      case 6:
        remoteVideoContainer.className = 'h-full w-full gap-1 grid grid-cols-3 grid-rows-2';
        break;
      case 7:
      case 8:
      case 9:
        remoteVideoContainer.className = 'h-full w-full gap-1 grid grid-cols-3 grid-rows-3';
        break;
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
        remoteVideoContainer.className = 'h-full w-full gap-1 grid grid-cols-5 grid-rows-3';
        break;
      default:
        remoteVideoContainer.className = 'h-full w-full gap-1 grid grid-cols-6 grid-rows-3 overflow-hidden';
    };
  }

  function setChatOffer(data, ws) {
    if (!pc) return;
    if (data.from_id !== user.id) {
      console.log(`setChatOffer ${data}`);
      pc.setRemoteDescription(data.desc)
        .then(() => {
          console.log('remote description setted.')
          pc.createAnswer()
            .then(answer => {
              console.log('answer created.')
              pc.setLocalDescription(answer)
                .then(() => {
                  console.log('local description setted.')
                  ws.send(JSON.stringify({
                    "message": "send_answer",
                    "message_type": data.message_type,
                    "to_id": data.to_id,
                    "desc": pc.localDescription,
                  }));
                  console.log('signal: send_answer sended.');
                })
            })
        })
    }
  };

  function setChatAnswer(data) {
    if (!pc) return;
    if (data.from_id !== user.id) {
      if (!pc.remoteDescription) {
        console.log(`setChatAnswer ${data}`);
        pc.setRemoteDescription(data.desc)
          .then(() => console.log('remote description setted.'))
          .catch(e => console.log(e.message));
      }
    }
  };

  function setChatCandidate(data) {
    if (!pc) return;
    if (pc.remoteDescription) {
      console.log(`setChatCandidate ${data}`);
      pc.addIceCandidate(data.desc);
    }
  }

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

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function calcUserCountMsg(users) {
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

  function calcChatCountMsg(chats) {
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
        message: "send_read",
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
      message: "send_new",
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
            message: "send_new",
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
    if (messageType === "user") {
      ws.send(JSON.stringify({
        message: "send_call",
        message_type: messageType,
        to_id: selectItem.id,
      }));
    } else {
      ws.send(JSON.stringify({
        message: "send_accept",
        message_type: messageType,
        to_id: selectItem.id,
      }));
    }
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
      message: "send_edit",
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
      message: "send_delete",
      message_type: messageType,
      message_id: deleteItem,
    }));

    setDeleteItem(null);
  }

  function handleDisconnetVideoChat() {
    if (!pc) return;
    pc.close();
    let remoteVideoContainer = document.getElementById('video-container');
    remoteVideoContainer.textContent = '';
    setCall(null);
    setOpenVideoChat(false);
    setSelectItem(null);
  }

  function handleRestartConnect() {
    pc.setConfiguration(null);
  }

  return (
    <div>
      {openVideoChat
        ? <VideoChat
          localVideoRef={localVideoRef}
          handleDisconnetVideoChat={handleDisconnetVideoChat}
          audioMute={audioMute}
          setAudioMute={setAudioMute}
          videoMute={videoMute}
          setVideoMute={setVideoMute}
          handleRestartConnect={handleRestartConnect}
        />
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
            />
          </div>
        </div>}
    </div>
  )
}
