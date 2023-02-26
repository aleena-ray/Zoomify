import { getExploreName } from '../utils/platform';

export const devConfig = {
    sdkKey: '',
    sdkSecret: '',
    webEndpoint: 'zoom.us',
    topic: "a",
    signature: "",
    userName: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
    password: ""
};
