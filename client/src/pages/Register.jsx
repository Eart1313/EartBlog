import React, { useContext, useState } from "react";
import { useAuth } from "../contexts/authContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const { proxy, currentUser } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.username || !input.email || !input.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(`${proxy}/auth/register`, input);
      setError(null);
      navigate("/login");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100vh] bg-[#b9e7e7]">
      <h1 className="text-[20px] text-[#008080] mb-[20px] font-bold">
        Register
      </h1>
      <form
        className="flex flex-col p-[50px] bg-[#fff] gap-[20px]"
        onSubmit={handleSubmit}>
        <input
          className="border-gray-400 border-b-[1px] p-[10px]"
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />
        <input
          className="border-gray-400 border-b-[1px] p-[10px]"
          type="email"
          placeholder="email"
          name="email"
          onChange={handleChange}
        />
        <input
          className="border-gray-400 border-b-[1px] p-[10px]"
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
        {error && (
          <p className="text-[12px] text-red-500 text-center">{error}</p>
        )}
        <button className="p-[10px] bg-[#008080] cursor-pointer text-white">
          Register
        </button>
        <span className="text-[12px] text-center ">
          Do you have an account?
          <Link className="underline pl-[5px]" to="/login">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Register;
