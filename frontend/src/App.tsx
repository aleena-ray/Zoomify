import React, { useEffect, useContext, useState, useCallback, useReducer, useMemo } from 'react';
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
import { isAndroidBrowser } from './utils/platform';;

interface AppProps {
  meetingArgs: {
    topic: string;
    signature: string;
    userName: string;
    password?: string;
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
    meetingArgs: {topic, signature, userName, password}
  } = props;
  const zmClient = ZoomVideo.createClient()
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
  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream }), [mediaState, mediaStream]);

  useEffect(() => {
    const init = async () => {
      await zmClient.init('en-US', 'CDN');  
    };
    init();
    return () => {
      ZoomVideo.destroyClient();
    };
  }, [zmClient, topic, signature, userName, password]);

  const onStartVideo = useCallback(async () => {
    try {
      const stream = zmClient.getMediaStream();
      if (status === "closed") {
        await zmClient.join(topic, signature, userName, password).catch((e) => {
          console.log(e);
        });
        setStatus("connected")
        
        await stream.startVideo();

      } else if (status === "connected") {
        zmClient.leave();
        setStatus("closed")
        await stream.stopVideo();
      }
    } catch (e: any) {
      message.error(e.reason);
    }
  }, [zmClient, topic, signature, userName, password, status]);

  return (
    <div className="App">
      <ZoomMediaContext.Provider value={mediaContext}>
        <button onClick={onStartVideo}>Turn on and off Video</button>
      </ZoomMediaContext.Provider>
      
    </div>
  );
}

export default App;