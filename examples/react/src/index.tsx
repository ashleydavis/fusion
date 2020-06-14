import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './services/toast'; // Make sure the Toast implementation is imported.

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
