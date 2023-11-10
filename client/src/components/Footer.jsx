import React from "react";
import Logo from "../img/logo.png";

const Footer = () => {
  return (
    <div className="flex justify-center">
      <div className="w-[1024px]">
        <footer className="flex items-center justify-between text-[12px] mt-[100px] p-[20px] bg-[#b9e7e7]">
          <img className="h-[50px]" src={Logo} alt="logo" />
          <span>
            Made with ❤️ and <b>React.js & Node.js</b>.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
