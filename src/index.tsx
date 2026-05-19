import React from 'react';
import ReactDOM from 'react-dom/client';
import '@vaadin/react-components/css/Lumo.css';
import '@vaadin/icons';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
);
