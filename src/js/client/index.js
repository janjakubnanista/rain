import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { main } from './reducers';

import App from './app';

let container = document.getElementById('container');
let store = createStore(main);

React.initializeTouchEvents(true);
React.render(<Provider store={store}>{() => <App/>}</Provider>, container);
