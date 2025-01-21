import { useEffect } from "react"
import { useAuth } from "./use-firebase.js"
import { useNavigate } from 'react-router-dom';

export function useRequireAuth(redirectUrl = '/'){

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user === false){
      navigate(redirectUrl)
    }
  }, [auth]);

  return auth;
  
}
