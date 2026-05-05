// Updated: 2026-05-05 20:03 - OAuth callback fix
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      console.log("[AuthCallback] Starting OAuth callback handling");
      console.log("[AuthCallback] Current URL:", window.location.href);
      
      // Wait for Supabase to process the URL hash
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try multiple approaches to get the session
      let session = null;
      let error = null;
      
      // Method 1: getSession()
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        session = sessionData?.session;
        error = sessionError;
        console.log("[AuthCallback] getSession result:", { hasSession: !!session, error: error?.message });
      } catch (e) {
        console.error("[AuthCallback] getSession error:", e);
      }
      
      // Method 2: Check URL hash for session params
      if (!session && window.location.hash) {
        console.log("[AuthCallback] Checking URL hash for session params");
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.get('access_token')) {
          console.log("[AuthCallback] Found access_token in hash, waiting for session to be established");
          // Wait a bit more for Supabase to process the hash
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try getSession again
          try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            session = sessionData?.session;
            error = sessionError;
            console.log("[AuthCallback] Second getSession attempt:", { hasSession: !!session, error: error?.message });
          } catch (e) {
            console.error("[AuthCallback] Second getSession error:", e);
          }
        }
      }
      
      if (session) {
        console.log("[AuthCallback] ✅ Session found, user:", session.user?.email);
        console.log("[AuthCallback] Navigating to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.error("[AuthCallback] ❌ No session found after all attempts");
        if (error) console.error("[AuthCallback] Error details:", error);
        console.log("[AuthCallback] Redirecting to login");
        navigate("/login", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Completing authentication...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
