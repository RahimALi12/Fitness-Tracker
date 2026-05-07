import { createContext, useEffect, useState } from 'react';
import { getUserFromToken } from '../utils/auth';
// import axios from '../utils/axios';

const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const existingUser = getUserFromToken();

//     if (token && existingUser) {
//       setUser(existingUser);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // ✅ Set default header on reload
//     }
//   }, []);

//   const loginUser = (userData) => {
//     localStorage.setItem('token', userData.token);
//     localStorage.setItem('user', JSON.stringify(userData.user));

//     axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`; // ✅ Apply token globally
//     setUser(userData.user);
//   };

//   const logoutUser = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');

//     delete axios.defaults.headers.common['Authorization']; // ❌ Remove token from axios
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 New

  useEffect(() => {
    const token = localStorage.getItem('token');
    const existingUser = getUserFromToken();

    if (token && existingUser) {
      setUser(existingUser);
    }
    setLoading(false); // ✅ Stop loading once done
  }, []);

  const loginUser = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export default AuthContext;
