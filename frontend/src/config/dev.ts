import { getExploreName } from '../utils/platform';

export const devConfig = {
  sdkKey: '',
  sdkSecret: '',
  webEndpoint: 'zoom.us',
  topic: "a",
  signature: "",
  // signature: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfa2V5IjoieXlRS1o2d1NpZURHYzlEVEkxN3d3eHJaclBocmdack9qYmlBIiwidHBjIjoiYSIsInJvbGVfdHlwZSI6MSwidmVyc2lvbiI6MSwiaWF0IjoxNjc3MzQ0NDY0LCJleHAiOjE2NzczNTE2NjR9.FyRk2em3ta-lgGf1BSFycBTOXQqsrstSSaOerPqUPcI'",
  userName: `${getExploreName()}-${Math.floor(Math.random() * 1000)}`,
  password: ""
};
