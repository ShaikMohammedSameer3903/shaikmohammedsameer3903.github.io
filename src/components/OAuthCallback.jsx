import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // Small delay to ensure Supabase has parsed the URL tokens
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase.auth.getSession();

      if (data?.session) {
        console.log("[AuthCallback] Session found, navigating to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        if (error) console.error("[AuthCallback] Error getting session:", error.message);
        console.warn("[AuthCallback] No session found, redirecting to login");
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
