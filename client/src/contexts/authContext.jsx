import React, { useEffect, useState } from "react";

const AuthContext = React.createContext();

function AuthProvider(props) {
  // const proxy = "http://localhost:4000/api";
  const proxy = "https://eart-blog-api.vercel.app/api";
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ proxy, currentUser, setCurrentUser }}>
      {props.children}
    </AuthContext.Provider>
  );
}
const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
