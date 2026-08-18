import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const GoogleSignInButton = ({ text = 'continue_with' }) => {
  const { googleLogin } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '637125508707-uijuuung66cvjdoro0d4s699q8s4lt10.apps.googleusercontent.com';

  useEffect(() => {
    // Load Google Identity Services Script dynamically
    const scriptId = 'google-gsi-script';
    let script = document.getElementById(scriptId);

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              googleLogin(response.credential);
            }
          },
        });

        const container = document.getElementById('googleSignInBtnContainer');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: text,
            shape: 'pill',
            logo_alignment: 'left',
          });
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, [clientId, googleLogin, text]);

  return (
    <div className="w-full flex justify-center">
      <div id="googleSignInBtnContainer" className="w-full min-h-[40px] flex justify-center" />
    </div>
  );
};
