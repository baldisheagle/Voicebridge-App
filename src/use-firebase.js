import React, { useState, useEffect, useContext, createContext } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInWithPopup, onAuthStateChanged, signOut, GoogleAuthProvider } from "firebase/auth";

// PRODUCTION
const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:  process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:  process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {

  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [authenticating, setAuthenticating] = useState(false);

  const signout = () => {
    signOut(auth).then(() => {
      setUser(false);
    }).catch((error) => {
      console.log("error");
    });
  };

  const googleLogin = () => {
    setAuthenticating(true);

    signInWithPopup(auth, provider).then((result) => {
      // Get user
      getDoc(doc(db, "users", result.user.uid)).then((userDoc) => {
        if (userDoc.exists()) {
          // Set user
          setUser(userDoc.data());
          // Get user's default workspace - workspace.id === user.uid
          getDoc(doc(db, "workspaces", userDoc.data().uid)).then((workspaceDoc) => {
            setWorkspace(workspaceDoc.data());
          });
          setAuthenticating(false);
          return true;
        } else {
          // Create user
          setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            fullName: result.user.displayName,
            photoUrl: result.user.photoURL,
            accessToken: result.user.accessToken,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).then(() => {
            setUser({
              uid: result.user.uid,
              email: result.user.email,
              fullName: result.user.displayName,
              photoUrl: result.user.photoURL,
              accessToken: result.user.accessToken,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Create workspace
            setDoc(doc(db, "workspaces", result.user.uid), {
              id: result.user.uid,
              name: 'My Workspace',
              admins: [result.user.uid],
              members: [result.user.uid],
              createdAt: new Date(),
              updatedAt: new Date(),
            }).then(() => {
              setWorkspace({
                id: result.user.uid,
                name: 'My Workspace',
                admins: [result.user.uid],
                members: [result.user.uid],
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              setAuthenticating(false);
              return true;
            }).catch((error) => { // Create workspace error
              console.log("error", error);
              setAuthenticating(false);
              return false;
            });
          }).catch((error) => { // Create user error
            console.log("error", error);
            setAuthenticating(false);
            return false;
          });
        }
      }).catch((error) => { // Get user error
        console.log("error", error);
        setAuthenticating(false);
        return false;
      });
    }).catch((error) => { // Sign in with popup error
      console.log("googleLogin error", error);
      setAuthenticating(false);
      return false;
    });
  }

  const updateUser = (_user) => {
    setUser(_user);
  };

  const updateWorkspace = (_workspace) => {
    setWorkspace(_workspace);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (_user) => {
      if (_user) {
        getDoc(doc(db, "users", _user.uid)).then((userDoc) => {
          if (userDoc.exists()) {
            setUser(userDoc.data());
            // Get user's default workspace - workspace.id === user.uid
            getDoc(doc(db, "workspaces", userDoc.data().uid)).then((workspaceDoc) => {
              setWorkspace(workspaceDoc.data());
            });
          } else {
            setUser(false);
          }
        });
      } else {
        setUser(false);
      }
    });
  }, []);

  return {
    user,
    workspace,
    signout,
    updateUser,
    updateWorkspace,
    googleLogin,
    authenticating,
  };

};


