import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authUtils } from "@/utils/auth";
import { API_CONFIG, ROUTES } from "@/api/config";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth Configuration
  const AUTH_URL = API_CONFIG.BASE_URL + "/connect/authorize";
  const TOKEN_URL = API_CONFIG.BASE_URL + "/connect/token";
  const CLIENT_ID = "com.ramco.nebula.clients";
  const REDIRECT_URI = `${window.location.origin}/Forwardis-dev/callback`; // Must be registered
  const SCOPE = "openid rvw_impersonate offline_access";

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || ROUTES.HOME;

  // Generate code challenge for PKCE
  const generateCodeChallenge = async (
    codeVerifier: string
  ): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  // Generate random string for code verifier
  const generateRandomString = (length: number = 128): string => {
    const charset =
      "yVDWSNsF5dTRCAc2x6dGwaxB+RgbFdl8QedYksOyFgp+KRnK4SZa3pBN9qJwnd76";
    let result = "";
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);

    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }

    return result;
  };

  // Start PKCE OAuth flow
  const startPKCEFlow = async () => {
    try {
      // setIsLoading(true);
      setError(null);

      const codeVerifier = generateRandomString();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Save code verifier for later use
      localStorage.setItem("code_verifier", codeVerifier);

      // Build authorization URL
      const authUrl = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(
        SCOPE
      )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

      // Redirect to authorization server
      setTimeout(() => {
        window.location.href = authUrl;
      }, 2000);
    } catch (err) {
      setError("Failed to start authentication flow");
      console.error("PKCE flow error:", err);
    } finally {
      // setIsLoading(false);
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      try {
        // setIsLoading(true);
        setError(null);

        const codeVerifier = localStorage.getItem("code_verifier");

        if (!codeVerifier) {
          throw new Error("Code verifier not found");
        }

        // Exchange code for token
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          code: code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        });

        const response = await fetch(TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error(`Token exchange failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("Access Token:", data.access_token);

        // Store the token
        authUtils.setToken(data.access_token);

        // Clean up code verifier
        localStorage.removeItem("code_verifier");

        // Redirect to intended destination
        navigate(from, { replace: true });
      } catch (err) {
        setError("Failed to complete authentication");
        console.error("Token exchange error:", err);
        localStorage.removeItem("code_verifier");
      } finally {
        // setIsLoading(false);
      }
    }
  };

  // Check for OAuth callback or start OAuth flow on component mount

  useEffect(() => {
    const delay = setTimeout(() => {
      // const urlParams = new URLSearchParams(window.location.search);
      // const code = urlParams.get("code");
      
      // if (code) {
        // Handle OAuth callback
        // handleOAuthCallback();
      // } else {
        // Start OAuth flow automatically
        // startPKCEFlow();
      // }
      navigate(ROUTES.HOME, { replace: true });
    }, 2000);

    return () => clearTimeout(delay);
  }, []);


  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <p className="text-[26px] font-bold text-gray-800">
        Redirecting to Identity server....
      </p>
    </div>
  );
};

export default SignIn;
