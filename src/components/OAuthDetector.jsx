import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function OAuthDetector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuth = async () => {
      // 1. Check if tokens are in the hash (Supabase standard)
      const fullHash = window.location.hash || location.hash;
      if (!fullHash || !fullHash.includes('access_token=')) return;

      console.log("[OAuthDetector] Detecting tokens in hash...");

      // Split by '#' and find the segment containing access_token
      const parts = fullHash.split('#');
      const tokenPart = parts.find(p => p.includes('access_token='));
      
      if (!tokenPart) return;

      const params = new URLSearchParams(tokenPart.startsWith('?') ? tokenPart : '?' + tokenPart);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        console.log("[OAuthDetector] Tokens found, setting session...");
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;

          console.log("[OAuthDetector] Session set successfully, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        } catch (err) {
          console.error("[OAuthDetector] Error setting session:", err.message);
          navigate("/login", { replace: true });
        }
      }
    };

    handleOAuth();
  }, [location, navigate]);

  return null;
}

export default OAuthDetector;
