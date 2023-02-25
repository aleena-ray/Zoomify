import { getExploreName } from '../utils/platform';

export const devConfig = {
    sdkKey: 'yyQKZ6wSieDGc9DTI17wwxrZrPhrgZrOjbiA',
    sdkSecret: 'ogJ8gdVGEQ05XoFQ1buXFevOi3R7n0FjrGqF',
    webEndpoint: 'zoom.us',
    topic: "a",
    signature: "",
    userName: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
    password: ""
};
