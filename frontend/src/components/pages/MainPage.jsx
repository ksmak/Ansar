import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from "html-to-draftjs";
import { v4 as uuidv4 } from 'uuid';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";

import api from '../../api/index';
import PanelTop from "../UI/PanelTop";
import PanelLeft from "../UI/PanelLeft";
import PanelRight from "../UI/PanelRight";
import AlertSend from "../UI/AlertSend";
import AlertError from "../UI/AlertError";
import DialogEditMessage from "../UI/DialogEditMessage";
import DialogDeleteMessage from "../UI/DialogDeleteMessage";
import DialogCall from "../UI/DialogCall";

const MainPage = () => {
  const navigate = useNavigate();

  const [socket, setSocket] = useState({});

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

  const [videochat, setVideoChat] = useState(false);

  const [localStream, setLocalStream] = useState(null);

  const [peerConnection, setPeerConnection] = useState(null);

  const userId = Number(sessionStorage.getItem('user_id'));

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const calcUserCountMsg = (users) => {
    let result = {};

    let total = 0;

    users.length > 0 && users.forEach(item => {
      let messages = item.messages.filter(msg =>
        msg.from_user !== userId
        && msg.to_user === userId
        && msg.readers.findIndex(reader => reader.id === userId) === -1
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
        msg.from_user !== userId
        && msg.readers.findIndex(reader => reader.id === userId) === -1
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

  useEffect(() => {
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

        let skt = { '0': createSocket(0) }

        resp.data.forEach(group => {
          skt[group.id] = createSocket(group.id);
        });

        setSocket(skt);
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
    if (chats.length > 0) setCountChatMsg(calcChatCountMsg(chats));
    // eslint-disable-next-line
  }, [chats]);

  useEffect(() => {
    if (users.length > 0) setCountUserMsg(calcUserCountMsg(users));
    // eslint-disable-next-line
  }, [users]);

  useEffect(() => {
    if (videochat) handleCreatePeerConnection();
    // eslint-disable-next-line
  }, [videochat]);

  const createVideo = (id) => {
    let videoContainer = document.getElementById('video-container');

    let remoteVideo = document.createElement('video');

    remoteVideo.id = `video_${id}`;

    remoteVideo.autoplay = true;

    videoContainer.appendChild(remoteVideo);

    return remoteVideo;
  }

  const removeVideo = (id) => {
    let remoteVideo = document.getElementById(`video_${id}`);
    remoteVideo.remove();
  }

  const createSocket = (group) => {
    let accessToken = sessionStorage.getItem('access');

    const socket = new WebSocket(`${process.env.REACT_APP_WS_HOST}/ws/chat/${group}?token=${accessToken}`);

    socket.onmessage = function (e) {
      const data = JSON.parse(e.data);

      switch (data.category) {
        case "call_videochat":
          setCall(data);

          break;

        case "cancel_videochat":
          setCall(null);

          break;

        case "accept_videochat":
          setCall(null);

          if (data.message_type === "user" || data.from_user_id === userId) {
            setVideoChat(true);
          }

          break;

        case "offer_videochat":
          handleCreateOffer(data.offer);

          break;

        case "answer_videochat":
          handleCreateAnswer(data.answer);

          break;

        case "icecandidate_videochat":
          handleCreateCandidate(data.candidate);

          break;

        case "change_chat":
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

          break;

        case "new_message":
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

          break;

        case "change_message":
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

          break;

        default:
          setError("Unknown message type!");

          break;
      }
    }

    return socket;
  }

  const handleItemClick = (item) => {
    setSelectItem(item);

    setMessages(item.messages);

    let unread_messages = item.messages.filter(msg =>
      msg.from_user !== userId
      && msg.readers.findIndex(reader => reader.id === userId) === -1
    );

    unread_messages.forEach(msg => {
      const message = {
        message: "read_message",
        message_type: messageType,
        message_id: msg.id,
      }

      if (messageType === "user") {
        socket['0'].send(JSON.stringify(message));
      } else {
        socket[item.id].send(JSON.stringify(message));
      }
    });
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
      filename: null,
      uuid: uuidv4(),
    }

    setSends(prev =>
      prev.concat({
        uuid: message.uuid,
        title: `Отправка сообщения "${message.text.substring(0, 20)}..." в "${selectItem.title || selectItem.full_name}" ...`
      }
      ));

    if (messageType === "user") {
      socket['0'].send(JSON.stringify(message));
    } else {
      socket[selectItem.id].send(JSON.stringify(message));
    }

    setText('');

    setEditorState(() => EditorState.createEmpty());
  }

  const handleSendFile = () => {
    let input = document.createElement('input');

    input.setAttribute('multiple', '');

    input.type = 'file';

    input.onchange = (e) => {
      let files = [...e.target.files];

      let file_data = [];

      for (const file of files) {
        file_data.push({
          'file': file,
          'uuid': uuidv4(),
        });
      }

      file_data.forEach(async (f) => {
        let formData = new FormData();

        formData.append('file', f.file);

        setSends(prev =>
          prev.concat({
            uuid: f.uuid,
            title: `Отправка файла "${f.file.name}" в "${selectItem.title || selectItem.full_name}" ...`
          }
          ));

        try {
          const response = await api.ansarClient.upload_file(formData);

          const message = {
            message: "send_message",
            message_type: messageType,
            id: selectItem.id,
            text: null,
            filename: response.data.filename,
            uuid: f.uuid,
          }

          if (messageType === "user")
            socket['0'].send(JSON.stringify(message));
          else
            socket[selectItem.id].send(JSON.stringify(message));

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

  const handleCallVideoChat = async () => {
    const constraints = {
      'video': true,
      'audio': true,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setLocalStream(stream);

      if (messageType === "user") {
        const message = {
          message: "calling_videochat",
          message_type: messageType,
          to_id: selectItem.id,
        };

        socket['0'].send(JSON.stringify(message));

      } else {
        const message = {
          message: "accepting_videochat",
          message_type: messageType,
          to_id: selectItem.id,
        };

        socket[selectItem.id].send(JSON.stringify(message));
      }
    } catch (e) {
      console.log('Error accessing media devices', e);
    }
  }

  const handleCancelCallVideoChat = () => {
    const message = {
      message: "canceling_videochat",
      message_type: call.message_type,
      to_id: call.to_id,
    };

    socket['0'].send(JSON.stringify(message));
  }

  const handleAcceptCallVideoChat = () => {
    const message = {
      message: "accepting_videochat",
      message_type: call.message_type,
      to_id: call.to_id,
    };

    socket['0'].send(JSON.stringify(message));
  }

  async function handleCreatePeerConnection() {
    let localVideo = document.getElementById('local-video');

    localVideo.srcObject = localStream;

    let peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const message = {
          message: "new_candidate_videochat",
          candidate: event.candidate,
        }

        if (messageType === "user")
          socket['0'].send(JSON.stringify(message));
        else
          socket[selectItem.id].send(JSON.stringify(message));
      }
    };

    peerConnection.ontrack = (event) => {
      localVideo.srcObject = event.streams[0];
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const message = {
      message: "new_offer_videochat",
      offer: offer,
    }

    if (messageType === "user")
      socket['0'].send(JSON.stringify(message));
    else
      socket[selectItem.id].send(JSON.stringify(message));

    setPeerConnection(peerConnection);
  }

  async function handleCreateOffer(offer) {
    let peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const message = {
          message: "new_candidate_videochat",
          candidate: event.candidate,
        }

        if (messageType === "user")
          socket['0'].send(JSON.stringify(message));
        else
          socket[selectItem.id].send(JSON.stringify(message));
      }
    };

    let remoteVideo = createVideo();

    peerConnection.ontrack = (event) => {
      remoteVideo.srcObject = event.streams[0];
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const message = {
      message: "new_answer_videochat",
      answer: answer,
    }

    if (messageType === "user")
      socket['0'].send(JSON.stringify(message));
    else
      socket[selectItem.id].send(JSON.stringify(message));

    setPeerConnection(peerConnection);
  }

  async function handleCreateAnswer(answer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async function handleCreateCandidate(candidate) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);

    const markup = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );

    setText(markup);
  };

  const onEditorEditStateChange = (editorEditState) => {
    setEditorEditState(editorEditState);

    const markup = draftToHtml(
      convertToRaw(editorEditState.getCurrentContent())
    );

    setEditText(markup);
  }

  const handleOpenEditMessageDialog = (message_id) => {
    setEditItem(message_id);

    const message = selectItem.messages.find(msg => msg.id === message_id);

    const blocksFromHtml = htmlToDraft(message.text);

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

    if (messageType === "user")
      socket['0'].send(JSON.stringify(message));
    else
      socket[selectItem.id].send(JSON.stringify(message));

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

    if (messageType === "user")
      socket['0'].send(JSON.stringify(message));
    else
      socket[selectItem.id].send(JSON.stringify(message));

    setDeleteItem(null);
  }

  return (
    <div>
      {videochat
        ? <div className="h-[calc(100vh-6rem)] w-full bg-gray">
          Video Chat
          <div id="video-container">
            <video id="local-video" muted autoPlay></video>
          </div>
        </div>
        : <div className="h-[calc(100vh-6rem)]">
          <div className="absolute opacity-55 w-full flex flex-col gap-1">
            {sends && sends.map(send => (
              <AlertSend key={send.uuid} title={send.title} />
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
            userId={userId}
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
              userId={userId}
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

export default MainPage;