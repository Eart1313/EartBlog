import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import Parser from "html-react-parser";

const Home = () => {
  const { proxy } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const category = useLocation().search;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(`${proxy}/post${category}`);
        setPosts(data.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [posts]);

  // convert html tag in quill filter only text
  function stripHtmlTags(input) {
    return input.replace(/(<([^>]+)>)/gi, "");
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[69vh]">
        <div className="animate-spin rounded-full h-[100px] w-[100px] border-t-[6px] border-[#b9e7e7] border-solid"></div>
        <div className="mt-[50px] text-[#0a9c9c]">
          loading<span className="dots"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-[1024px]">
        <div>
          <div className="mt-[50px] flex flex-col gap-[150px]">
            {posts?.length === 0 && (
              <div className="flex justify-center text-[24px] text-[#21a0a0]">
                No posts yet
              </div>
            )}
            {posts?.map((item, index) => (
              <div
                className={`flex gap-[100px] ${
                  index % 2 === 0 ? "flex-row-reverse" : ""
                }`}
                key={item?.id}>
                <div className="relative flex-[2] after:h-[350px] after:z-[-1] after:w-[100%] after:absolute after:top-[20px] after:left-[-20px] after:-inset-1 after:bg-[#b9e7e7] ">
                  <img
                    className="w-[100%] h-[350px] object-cover"
                    src={item?.img}
                    alt={item?.title}
                  />
                </div>
                <div className="flex-[3] flex flex-col justify-between">
                  <Link to={`/post/${item?.id}`}>
                    <h1 className="text-[46px] font-semibold max-w-xl overflow-hidden m-[5px]">
                      {item.title.slice(0, 60)}
                    </h1>
                  </Link>
                  <p className="text-[16px] max-w-xl overflow-hidden  m-[10px]">
                    {stripHtmlTags(`${item?.desc}`).slice(0, 300)}...
                  </p>
                  <button
                    onClick={() => navigate(`/post/${item?.id}`)}
                    className="w-max py-[10px] px-[20px] cursor-pointer border border-[1px] hover:border-[#fff] hover:bg-[#b9e7e7] hover:text-[#000000] border-[#008080] text-[#008080]">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
