import React, { useState } from "react";
import { useAuth } from "../contexts/authContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const { proxy, currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.username || !input.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const data = await axios.post(`${proxy}/auth/login`, input, {
        withCredentials: true,
      });
      setError(null);
      setCurrentUser(data.data);
      navigate("/");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100vh] bg-[#b9e7e7]">
      <h1 className="text-[20px] text-[#008080] mb-[20px] font-bold">Login</h1>
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
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
        {error && (
          <p className="text-[12px] text-red-500 text-center">{error}</p>
        )}
        <button className="p-[10px] bg-[#008080] cursor-pointer text-white">
          Login
        </button>
        <span className="text-[12px] text-center ">
          Don't you have an account?
          <Link className="underline pl-[5px]" to="/register">
            Register
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
