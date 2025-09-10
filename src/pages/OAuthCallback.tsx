import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authUtils } from '@/utils/auth';
import { ROUTES, Config } from '@/api/config';
import { authService } from '@/api/services/authService';

const CLIENT_ID = Config?.client_id;
const REDIRECT_URI = Config?.redirect_uri;
const TOKEN_URL = Config?.authUrl + "/connect/token";


const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback
  const handleOAuthCallback = async () => {
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");
    const state = searchParams.get("state");
    const session_state = searchParams.get("session_state");

    console.log("OAuth Callback Parameters:", {
      code,
      scope,
      state,
      session_state
    });

    if (true) {
      try {
        setIsLoading(true);
        setError(null);

        const codeVerifier = localStorage.getItem("code_verifier") || '';
        let tokenFormData = new FormData();
        tokenFormData.append("client_id", CLIENT_ID || '');
        tokenFormData.append("code", code || '');
        tokenFormData.append("redirect_uri", REDIRECT_URI || '');
        tokenFormData.append("code_verifier", codeVerifier || '');
        tokenFormData.append("grant_type", 'authorization_code');
        let PayloadParams = {
          client_id: CLIENT_ID,
          code: code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
          grant_type: "authorization_code",
        };
        // Use the service function for token exchange
        const data: any = authService.getAccessToken(TOKEN_URL, tokenFormData);
        // ({
        //   grant_type: "authorization_code",
        //   client_id: CLIENT_ID,
        //   code,
        //   redirect_uri: REDIRECT_URI,
        //   code_verifier: codeVerifier,
        // });

        console.log("Token exchange success:", data);

        // Store the token
        authUtils.setToken(data.access_token);

        // Clean up code verifier
        localStorage.removeItem("code_verifier");

        // Redirect to home page
        // setTimeout(() => {
        //   navigate(ROUTES.HOME, { replace: true });
        // }, 3000);
      } catch (err) {
        setError('Failed to complete authentication');
        console.error('Token exchange error:', err);
        localStorage.removeItem("code_verifier");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Missing required parameters in callback URL.');
      setIsLoading(false);
    }
  };

  // Handle callback on component mount
  useEffect(() => {
    handleOAuthCallback();
  }, []);

  return (
    <>
      {/* <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Redirecting to User Page ....
            </h2>
          </div>
        </div>
      </div> */}
      {/* Callback content */}
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-[26px] font-bold text-gray-800">
          Redirecting to User Page ....
        </p>
      </div>
    </>
  );
};

export default OAuthCallback; 