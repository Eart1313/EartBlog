import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/authContext";
import { Link, useNavigate } from "react-router-dom";

const Menu = ({ category, orderOfPost }) => {
  const [posts, setPosts] = useState();
  const { proxy } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(`${proxy}/post?category=${category}`);
        setPosts(data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [category]);

  return (
    <div className="flex flex-col gap-[25px] flex-[2]">
      <h1 className="text-[20px] text-[#555] text-center">
        Other posts you may like
      </h1>
      {posts
        ?.slice(0, 5)
        .filter((item) => item.id !== orderOfPost)
        .map((item) => (
          <div className="flex flex-col gap-[10px]" key={item.id}>
            <img
              src={item.img}
              alt={item.title}
              className="w-[100%] h-[200px] object-cover"
            />
            <Link to={`/post/${item.id}`}>
              <h2 className="text-[#555] font-semibold text-[20px]">
                {item.title.slice(0, 120)}
              </h2>
            </Link>
            <button
              onClick={() => navigate(`/post/${item.id}`)}
              className="w-max py-[5.5px] px-[13px] cursor-pointer border border-[1px] hover:border-[#fff] hover:bg-[#b9e7e7] hover:text-[#000000] border-[#008080] text-[#008080]">
              Read More
            </button>
          </div>
        ))}
    </div>
  );
};

export default Menu;
