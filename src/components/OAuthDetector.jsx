import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function OAuthDetector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuth = async () => {
      const fullHash = window.location.hash || location.hash;
      const isCallback = fullHash.includes('access_token=');
      
      // 1. Handle OAuth Callback tokens
      if (isCallback) {
        console.log("[OAuthDetector] Detecting tokens in hash...");
        const parts = fullHash.split('#');
        const tokenPart = parts.find(p => p.includes('access_token='));
        
        if (tokenPart) {
          const params = new URLSearchParams(tokenPart.startsWith('?') ? tokenPart : '?' + tokenPart);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            try {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (error) throw error;
              
              // Clear hash to prevent loops and redirect
              window.location.hash = "#/dashboard";
              return;
            } catch (err) {
              console.error("[OAuthDetector] Error setting session:", err.message);
              navigate("/login", { replace: true });
            }
          }
        }
      }
      
      // 2. Handle Auto-Redirect for existing sessions (ONLY if on login/landing)
      const isOnAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';
      
      if (isOnAuthPage) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log("[OAuthDetector] Session exists, moving to dashboard");
          navigate("/dashboard", { replace: true });
        }
      }
    };

    handleOAuth();
  }, [location.pathname, navigate]);

  return null;
}

export default OAuthDetector;
