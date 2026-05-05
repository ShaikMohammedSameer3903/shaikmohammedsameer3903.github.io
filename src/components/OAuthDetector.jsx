import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function OAuthDetector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuth = async () => {
      console.log("[OAuthDetector] Running OAuth detection...");
      console.log("[OAuthDetector] Current URL:", window.location.href);
      console.log("[OAuthDetector] Hash:", window.location.hash);
      console.log("[OAuthDetector] Location hash:", location.hash);
      console.log("[OAuthDetector] Search params:", window.location.search);
      
      let accessToken = null;
      let refreshToken = null;
      
      // 1. Check if tokens are in the hash (Supabase standard)
      const fullHash = window.location.hash || location.hash;
      console.log("[OAuthDetector] Full hash:", fullHash);
      
      if (fullHash && fullHash.includes('access_token=')) {
        console.log("[OAuthDetector] Detecting tokens in hash...");
        
        // Split by '#' and find the segment containing access_token
        const parts = fullHash.split('#');
        const tokenPart = parts.find(p => p.includes('access_token='));
        
        if (tokenPart) {
          console.log("[OAuthDetector] Token part:", tokenPart);
          const params = new URLSearchParams(tokenPart.startsWith('?') ? tokenPart : '?' + tokenPart);
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
        }
      }
      
      // 2. Check if tokens are in search params (fallback)
      if (!accessToken && window.location.search) {
        console.log("[OAuthDetector] Checking search params for tokens...");
        const searchParams = new URLSearchParams(window.location.search);
        accessToken = searchParams.get('access_token');
        refreshToken = searchParams.get('refresh_token');
      }
      
      console.log("[OAuthDetector] Extracted tokens:", { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
      });

      if (accessToken && refreshToken) {
        console.log("[OAuthDetector] Tokens found, setting session...");
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;

          console.log("[OAuthDetector] Session set successfully, redirecting to dashboard");
          console.log("[OAuthDetector] Current URL before redirect:", window.location.href);
          
          // Add a small delay to ensure session is fully established
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force navigation to dashboard with replace
          window.location.hash = "#/dashboard";
          console.log("[OAuthDetector] Forced hash navigation to #/dashboard");
        } catch (err) {
          console.error("[OAuthDetector] Error setting session:", err.message);
          navigate("/login", { replace: true });
        }
      } else {
        console.log("[OAuthDetector] No tokens found, checking for existing session...");
        // Even if no tokens, check if we have a session (for direct navigation)
        try {
          const { data, error } = await supabase.auth.getSession();
          console.log("[OAuthDetector] Session check without tokens:", { 
            hasSession: !!data.session, 
            error: error?.message,
            userEmail: data.session?.user?.email 
          });
          
          if (data.session) {
            console.log("[OAuthDetector] Session exists, redirecting to dashboard");
            // Force navigation to dashboard with hash
            window.location.hash = "#/dashboard";
            console.log("[OAuthDetector] Forced hash navigation to #/dashboard");
          }
        } catch (e) {
          console.error("[OAuthDetector] Error checking session:", e);
        }
      }
    };

    handleOAuth();
  }, [location, navigate]);

  return null;
}

export default OAuthDetector;
