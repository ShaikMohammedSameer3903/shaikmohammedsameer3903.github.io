import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function OAuthDetector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkForOAuthTokens = async () => {
      console.log("[OAuthDetector] Checking URL for OAuth tokens");
      console.log("[OAuthDetector] Current location:", location.pathname + location.search + location.hash);
      
      // Check URL hash for OAuth tokens
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken) {
        console.log("[OAuthDetector] ✅ Found OAuth tokens in URL");
        console.log("[OAuthDetector] Access token present:", !!accessToken);
        console.log("[OAuthDetector] Refresh token present:", !!refreshToken);
        
        // Wait for Supabase to process the tokens
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the session
        try {
          const { data, error } = await supabase.auth.getSession();
          console.log("[OAuthDetector] Session check result:", { 
            hasSession: !!data.session, 
            error: error?.message,
            userEmail: data.session?.user?.email 
          });
          
          if (data.session) {
            console.log("[OAuthDetector] ✅ Session established, navigating to dashboard");
            navigate("/dashboard", { replace: true });
          } else {
            console.error("[OAuthDetector] ❌ No session found after OAuth");
            navigate("/login", { replace: true });
          }
        } catch (e) {
          console.error("[OAuthDetector] Error checking session:", e);
          navigate("/login", { replace: true });
        }
      } else {
        console.log("[OAuthDetector] No OAuth tokens found in URL");
      }
    };

    checkForOAuthTokens();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Processing authentication...</p>
      </div>
    </div>
  );
}

export default OAuthDetector;
