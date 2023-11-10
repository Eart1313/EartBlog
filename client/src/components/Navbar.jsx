import React from "react";
import Logo from "../img/logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import axios from "axios";

const Navbar = () => {
  const { proxy, currentUser, setCurrentUser } = useAuth();

  const logout = async () => {
    await axios.post(`${proxy}/auth/logout`, {}, { withCredentials: true });
    setCurrentUser(null);
  };

  return (
    <div className="flex justify-center">
      <div className="w-[1024px]">
        <div className="flex p-[10px] justify-between items-center">
          <div className="w-[120px]">
            <Link to="/">
              <img src={Logo} alt="logo" />
            </Link>
          </div>
          <div className="flex gap-[10px] font-[16px] font-light items-center">
            <Link to="/?category=art">
              <h6 className="text-[16px]">ART</h6>
            </Link>
            <Link to="/?category=science">
              <h6>SCIENCE</h6>
            </Link>
            <Link to="/?category=technology">
              <h6>TECHNOLOGY</h6>
            </Link>
            <Link to="/?category=cinema">
              <h6>CINEMA</h6>
            </Link>
            <Link to="/?category=design">
              <h6>DESIGN</h6>
            </Link>
            <Link to="/?category=food">
              <h6>FOOD</h6>
            </Link>
            <span className="font-semibold text-[#21a0a0]">
              {currentUser?.username &&
                currentUser.username.charAt(0).toLocaleUpperCase() +
                  currentUser.username.slice(1)}
            </span>
            {currentUser ? (
              <span className="cursor-pointer" onClick={logout}>
                Logout
              </span>
            ) : (
              <Link to="/login">
                <p>Login</p>
              </Link>
            )}
            <Link to="/write">
              <span className="flex items-center justify-center bg-[#b9e7e7] w-[50px] h-[50px] rounded-[50%] hover:text-[#008080] hover:bg-[#fff] hover:border border-[#008080]">
                Write
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
