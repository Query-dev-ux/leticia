import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';
// import { db } from './firebase';
// import { doc, getDoc, setDoc } from 'firebase/firestore';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [diagnostic, setDiagnostic] = useState({
    userId: '',
    subid: '',
    error: '',
    logStatus: '',
    url: '',
    debugLog: '',
  });

  async function logMiniAppOpen({ userId, subid, event = 'miniapp_open' }) {
    try {
      const debugInfo = {
        endpoint: 'https://15a2cc3e.tg-miniapp-bhf.pages.dev/api/firestore-log',
        payload: {
          userId,
          subid,
          event,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }
      };
      setDiagnostic((d) => ({ ...d, debugLog: JSON.stringify(debugInfo, null, 2) }));
      console.log('Логирую:', { userId, subid });
      const resp = await fetch('https://15a2cc3e.tg-miniapp-bhf.pages.dev/api/firestore-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subid,
          event,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        })
      });
      if (!resp.ok) throw new Error('Ошибка логирования: ' + resp.status);
      setDiagnostic((d) => ({ ...d, logStatus: 'Логирование успешно' }));
    } catch (e) {
      setDiagnostic((d) => ({ ...d, logStatus: 'Ошибка логирования', error: String(e), debugLog: (d.debugLog || '') + '\nОшибка: ' + String(e) }));
      setDiagnostic((d) => ({ ...d, logStatus: 'Ошибка логирования', error: String(e) }));
    }
  }

  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.setHeaderColor('#ffffff');
      WebApp.setBackgroundColor('#ffffff');

      // Получаем параметры из Telegram WebApp API
      let startParam = '';
      let userId = '';
      let subid = '';
      if (WebApp.initDataUnsafe && typeof WebApp.initDataUnsafe === 'object') {
        startParam = WebApp.initDataUnsafe.start_param || '';
      } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
        startParam = window.Telegram.WebApp.initDataUnsafe.start_param || '';
      }
      [userId, subid] = startParam.split('_');
      const url = `https://erupmrp.oneclickmoment.online/pt1p9ld?n1=upc2eb4&s1=${encodeURIComponent(subid || '')}&cid=${encodeURIComponent(subid || '')}`;

      console.log('userId:', userId, 'subid:', subid);
      setDiagnostic((d) => ({ ...d, userId, subid, url }));

      if (userId) {
        logMiniAppOpen({ userId, subid });
      }

      // Создаем iframe для отображения сайта
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.style.transform = 'scale(0.95)';
      iframe.style.transformOrigin = 'top center';
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.zIndex = '1';
      iframe.style.borderRadius = '10px';
      iframe.onload = () => {
        setIsLoading(false);
      };
      iframe.src = url;
      document.body.appendChild(iframe);
    } catch (e) {
      setDiagnostic((d) => ({ ...d, error: String(e) }));
    }
  }, []);

  return (
    <>
      <div className={`loading-container ${isLoading ? 'visible' : 'hidden'}`}>
        <div className="loading-spinner"></div>
      </div>
      {/* Диагностический блок для отладки */}
      <div style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(255,255,255,0.95)',
        color: '#222',
        zIndex: 9999,
        padding: '12px 18px',
        borderRadius: 8,
        fontSize: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: 350,
        wordBreak: 'break-all',
      }}>
        <b>Диагностика:</b><br/>
        <div><b>userId:</b> {diagnostic.userId || <span style={{color:'red'}}>нет</span>}</div>
        <div><b>subid:</b> {diagnostic.subid || <span style={{color:'red'}}>нет</span>}</div>
        <div><b>url:</b> {diagnostic.url}</div>
        <div><b>logStatus:</b> {diagnostic.logStatus}</div>
        {diagnostic.error && <div style={{color:'red'}}><b>Ошибка:</b> {diagnostic.error}</div>}
        {diagnostic.debugLog && <pre style={{fontSize:12, marginTop:8, background:'#f7f7f7', padding:8, borderRadius:4, maxHeight:200, overflow:'auto'}}>{diagnostic.debugLog}</pre>}
      </div>
    </>
  );
}

export default App; 