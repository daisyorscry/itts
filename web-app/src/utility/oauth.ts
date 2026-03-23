/**
 * OAuth Popup Handler
 * Opens OAuth in new window and listens for response via postMessage
 */

export interface OAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
  errorDescription?: string;
}

export function openOAuthPopup(url: string): Promise<OAuthResult> {
  return new Promise((resolve, reject) => {
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      url,
      'OAuth Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      console.error('[OAuth] Failed to open popup window');
      reject(new Error('Failed to open OAuth popup. Please allow popups for this site.'));
      return;
    }

    // Backend origin untuk validate message
    const backendOrigin = new URL(url).origin;

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('OAuth popup was closed before completing authentication'));
      }
    }, 500);

    const messageListener = (event: MessageEvent) => {
      
      // Validate message berasal dari backend origin
      if (event.origin !== backendOrigin) {
        return;
      }

      const { type, accessToken, refreshToken, expiresIn, error, errorDescription } = event.data || {};

      if (type === 'OAUTH_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        resolve({
          success: true,
          accessToken,
          refreshToken,
          expiresIn,
        });
      } else if (type === 'OAUTH_ERROR') {
        console.error('[OAuth] Error:', error, errorDescription);
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        popup.close();
        resolve({
          success: false,
          error,
          errorDescription,
        });
      }
    };

    window.addEventListener('message', messageListener);
  });
}