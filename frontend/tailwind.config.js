
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ["Roboto Mono"],
      },
      colors: {
        primary: '#033c72',
        primarybgcolor: '#c3eeff',
        bordercolor: 'gray',
        secondarybgcolor: 'lightgray',
        formbgcolor: '#29a1f1',
        formcolor: 'white',
        chatcolor: '#8af7a1',
        chatselectcolor: 'rgb(240, 237, 237)', 
        messageownercolor: '#8af7a1',
        messageothercolor: 'white',
      },
    },
  },
  plugins: [],
});