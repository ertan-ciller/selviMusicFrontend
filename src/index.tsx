import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import selviSanatLogo from './selviSanatLogo.jpeg';

function setFavicon(iconHref: string) {
  const ensureLink = (rel: string): HTMLLinkElement => {
    const existing = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
    if (existing) return existing;
    const link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
    return link;
  };

  const iconLink = ensureLink('icon');
  iconLink.type = 'image/jpeg';
  iconLink.href = iconHref;

  const appleLink = ensureLink('apple-touch-icon');
  appleLink.href = iconHref;

  const shortcutLink = ensureLink('shortcut icon');
  shortcutLink.type = 'image/jpeg';
  shortcutLink.href = iconHref;
}

setFavicon(selviSanatLogo);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
