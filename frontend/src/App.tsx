import React, { useEffect, useContext, useState, useCallback, useReducer, useMemo } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ZoomVideo, { ConnectionState, ReconnectReason } from '@zoom/videosdk';
import { message, Modal } from 'antd';
import 'antd/dist/antd.min.css';
import produce from 'immer';
import Home from './feature/home/home';
import Video from './feature/video/video';
import VideoSingle from './feature/video/video-single';
import VideoNonSAB from './feature/video/video-non-sab';
import Preview from './feature/preview/preview';
import ZoomContext from './context/zoom-context';
import ZoomMediaContext from './context/media-context';
import ChatContext from './context/chat-context';
import CommandContext from './context/cmd-context';
import LiveTranscriptionContext from './context/live-transcription';
import RecordingContext from './context/recording-context';
import LoadingLayer from './component/loading-layer';
import Chat from './feature/chat/chat';
import Command from './feature/command/command';
import Subsession from './feature/subsession/subsession';
import {
  ChatClient,
  CommandChannelClient,
  LiveTranscriptionClient,
  MediaStream,
  RecordingClient,
  SubsessionClient
} from './index-types';
import './App.css';
import SubsessionContext from './context/subsession-context';
import { isAndroidBrowser } from './utils/platform';
interface AppProps {
  meetingArgs: {
    sdkKey: string;
    topic: string;
    signature: string;
    userName: string;
    password?: string;
    webEndpoint?: string;
    enforceGalleryView?: string;
  };
}
const mediaShape = {
  audio: {
    encode: false,
    decode: false
  },
  video: {
    encode: false,
    decode: false
  },
  share: {
    encode: false,
    decode: false
  }
};
const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case 'audio-encode': {
      draft.audio.encode = action.payload;
      break;
    }
    case 'audio-decode': {
      draft.audio.decode = action.payload;
      break;
    }
    case 'video-encode': {
      draft.video.encode = action.payload;
      break;
    }
    case 'video-decode': {
      draft.video.decode = action.payload;
      break;
    }
    case 'share-encode': {
      draft.share.encode = action.payload;
      break;
    }
    case 'share-decode': {
      draft.share.decode = action.payload;
      break;
    }
    case 'reset-media': {
      Object.assign(draft, { ...mediaShape });
      break;
    }
    default:
      break;
  }
}, mediaShape);

declare global {
  interface Window {
    webEndpoint: string | undefined;
    zmClient: any | undefined;
    mediaStream: any | undefined;
    crossOriginIsolated: boolean;
    ltClient: any | undefined;
  }
}

function App(props: AppProps) {

  const {
    meetingArgs: { sdkKey, topic, signature, userName, password, webEndpoint: webEndpointArg, enforceGalleryView }
  } = props;
  const [loading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [isFailover, setIsFailover] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('closed');
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [recordingClient, setRecordingClient] = useState<RecordingClient | null>(null);
  const [commandClient, setCommandClient] = useState<CommandChannelClient | null>(null);
  const [subsessionClient, setSubsessionClient] = useState<SubsessionClient | null>(null);
  const [liveTranscriptionClient, setLiveTranscriptionClient] = useState<LiveTranscriptionClient | null>(null);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState<boolean>(true);

  const zmClient = useContext(ZoomContext);

  const commands = [
    {
      command: "turn on my video",
      callback: () => {
        console.log("omg turn on!!")
        zmClient.getMediaStream().startVideo();
      },
    },
    {
        command: "turn on video",
        callback: () => {
          console.log("omg turn on!!")
          zmClient.getMediaStream().startVideo();
        },
      },
      {
        command: "turn off my video",
        callback: () => {
          console.log("omg turn off!!")
          zmClient.getMediaStream().startVideo();
        },
      },
      {
        command: "turn off video",
        callback: () => {
          console.log("omg turn off!!")
          zmClient.getMediaStream().startVideo();
        },
      },
    {
      command: "screen on",
      callback: () => {
        console.log("omg turn on!!")
        zmClient.getMediaStream().stopVideo();
      },
    },
    {
        command: "screen off",
        callback: () => {
          console.log("omg turn off!!")
          zmClient.getMediaStream().stopVideo();
        },
      },
      {
        command: "share screen",
        callback: () => {
          console.log("omg turn on!!")
          zmClient.getMediaStream().stopVideo();
        },
      },
      {
        command: "share my screen",
        callback: () => {
          console.log("omg turn on!!")
          zmClient.getMediaStream().stopVideo();
        },
      },
      {
        command: "stop sharing",
        callback: () => {
          console.log("omg turn off!!")
          zmClient.getMediaStream().stopVideo();
        },
      },
      {
        command: "stop sharing",
        callback: () => {
          console.log("omg turn off!!")
          zmClient.getMediaStream().stopVideo();
        },
      },
      {
        command: "stop sharing",
        callback: () => {
          console.log("omg turn off!!")
          zmClient.getMediaStream().stopVideo();
        },
      },
      {
        command: "hang up",
        callback: () => {
          console.log("omg leave!!")
          zmClient.getMediaStream().hangup()
        },
      },
      {
        command: "leave call",
        callback: () => {
          console.log("omg leave!!")
          zmClient.getMediaStream().hangup()
        },
      },
      {
        command: "log off",
        callback: () => {
          console.log("omg leave!!")
          zmClient.getMediaStream().hangup()
        },
      },
      {
        command: "mute",
        callback: () => {
          console.log("omg mute!!")
          zmClient.getMediaStream().muteAudio()
        },
      },
      {
        command: "unmute",
        callback: () => {
          console.log("omg unmute!!")
          zmClient.getMediaStream().unmuteAudio()
        },
      },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
  } = useSpeechRecognition({commands});


  let webEndpoint: any;
  if (webEndpointArg) {
    webEndpoint = webEndpointArg;
  } else {
    webEndpoint = window?.webEndpoint ?? 'zoom.us';
  }
  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream }), [mediaState, mediaStream]);
  const galleryViewWithoutSAB = Number(enforceGalleryView) === 1 && !window.crossOriginIsolated;
  useEffect(() => {
    const init = async () => {
      await zmClient.init('en-US', `${window.location.origin}/lib`, {
        webEndpoint,
        enforceMultipleVideos: galleryViewWithoutSAB,
        stayAwake: true
      });
      try {
        setLoadingText('Joining the session...');
        await zmClient.join(topic, signature, userName, password).then(() => {
        }).catch((error) => {
          console.log("is there a problem in our join session???")
          console.log(error)
          console.log(signature);
        })
        // await zmClient.join(topic, signature, userName, password).catch((e) => {
        //   console.log(e);
        // });
        const stream = zmClient.getMediaStream();
        setMediaStream(stream);
        setIsSupportGalleryView(stream.isSupportMultipleVideos() && !isAndroidBrowser());
        // const chatClient = zmClient.getChatClient();
        // const commandClient = zmClient.getCommandClient();
        // const recordingClient = zmClient.getRecordingClient();
        // const ssClient = zmClient.getSubsessionClient();
        // const ltClient = zmClient.getLiveTranscriptionClient();
        // setChatClient(chatClient);
        // setCommandClient(commandClient);
        // setRecordingClient(recordingClient);
        // setSubsessionClient(ssClient);
        // setLiveTranscriptionClient(ltClient);
        setIsLoading(false);
      } catch (e: any) {
        setIsLoading(false);
        message.error(e.reason);
      }
    };
    init();
    return () => {
      ZoomVideo.destroyClient();
    };
  }, [sdkKey, signature, zmClient, topic, userName, password, webEndpoint, galleryViewWithoutSAB]);
  const onConnectionChange = useCallback(
    (payload) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus('connecting');
        const { reason, subsessionName } = payload;
        if (reason === ReconnectReason.Failover) {
          setLoadingText('Session Disconnected,Try to reconnect');
        } else if (reason === ReconnectReason.JoinSubsession || reason === ReconnectReason.MoveToSubsession) {
          setLoadingText(`Joining ${subsessionName}...`);
        } else if (reason === ReconnectReason.BackToMainSession) {
          setLoadingText('Returning to Main Session...');
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus('connected');
        if (isFailover) {
          setIsLoading(false);
        }
        window.zmClient = zmClient;
        window.mediaStream = zmClient.getMediaStream();

        console.log('getSessionInfo', zmClient.getSessionInfo());
      } else if (payload.state === ConnectionState.Closed) {
        setStatus('closed');
        dispatch({ type: 'reset-media' });
        if (payload.reason === 'ended by host') {
          Modal.warning({
            title: 'Meeting ended',
            content: 'This meeting has been ended by host'
          });
        }
      }
    },
    [isFailover, zmClient]
  );
  const onMediaSDKChange = useCallback((payload) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === 'success' });
  }, []);

  const onDialoutChange = useCallback((payload) => {
    console.log('onDialoutChange', payload);
  }, []);

  const onAudioMerged = useCallback((payload) => {
    console.log('onAudioMerged', payload);
  }, []);

  const handleListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
    });
  };

  const onLeaveOrJoinSession = useCallback(async () => {
    if (status === 'closed') {
      setIsLoading(true);
      await zmClient.join(topic, signature, userName, password);
      setIsLoading(false);
    } else if (status === 'connected') {
      await zmClient.leave();
      message.warn('You have left the session.');
    }
  }, [zmClient, status, topic, signature, userName, password]);
  useEffect(() => {
    zmClient.on('connection-change', onConnectionChange);
    // zmClient.on('media-sdk-change', onMediaSDKChange);
    // zmClient.on('dialout-state-change', onDialoutChange);
    // zmClient.on('merged-audio', onAudioMerged);
    return () => {
      zmClient.off('connection-change', onConnectionChange);
      // zmClient.off('media-sdk-change', onMediaSDKChange);
      // zmClient.off('dialout-state-change', onDialoutChange);
      // zmClient.off('merged-audio', onAudioMerged);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange, onDialoutChange, onAudioMerged]);
  return (
    <div className="App">
      <div>
        <p>Microphone: {listening ? 'on' : 'off'}</p>
        <button onClick={SpeechRecognition.stopListening}>Stop</button>
        <button onClick={handleListening}>Start</button>
        <p>{transcript}</p>
      </div>
      {loading && <LoadingLayer content={loadingText} />}
      {!loading && (
        <ZoomMediaContext.Provider value={mediaContext}>
          {/* <ChatContext.Provider value={chatClient}>
            <RecordingContext.Provider value={recordingClient}>
              <CommandContext.Provider value={commandClient}>
                <SubsessionContext.Provider value={subsessionClient}>
                  <LiveTranscriptionContext.Provider value={liveTranscriptionClient}>

                  </LiveTranscriptionContext.Provider>
                </SubsessionContext.Provider>
              </CommandContext.Provider>
            </RecordingContext.Provider>
          </ChatContext.Provider> */}
                      <Router>
                      <Switch>
                        <Route
                          path="/"
                          render={(props) => (
                            <Home {...props} status={status} onLeaveOrJoinSession={onLeaveOrJoinSession} />
                          )}
                          exact
                        />
                        {/* <Route path="/index.html" component={Home} exact />
                        <Route path="/chat" component={Chat} />
                        <Route path="/command" component={Command} /> */}
                        <Route
                          path="/video"
                          component={isSupportGalleryView ? Video : galleryViewWithoutSAB ? VideoNonSAB : VideoSingle}
                        />
                        {/* <Route path="/subsession" component={Subsession} />
                        <Route path="/preview" component={Preview} /> */}
                      </Switch>
                    </Router>
        </ZoomMediaContext.Provider>
        
      )}
    </div>
  );
}

export default App;