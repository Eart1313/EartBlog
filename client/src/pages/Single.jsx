import React, { useEffect, useState } from "react";
import Delete from "../img/delete.png";
import Edit from "../img/edit.png";
import Menu from "../components/Menu.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/authContext";
import moment from "moment";
import Parser from "html-react-parser";
import { useParams } from "react-router-dom";

const Single = () => {
  const [post, setPost] = useState();
  const [isLoading, setIsLoading] = useState();
  const { proxy, currentUser } = useAuth();
  const location = useLocation();
  const orderOfPost = location.pathname.split("/")[2];
  const navigate = useNavigate();
  const params = useParams();

  const handleDelete = async (imgName) => {
    try {
      await axios.delete(`${proxy}/post/${orderOfPost}`, {
        withCredentials: true,
      });

      try {
        await axios.delete(`${proxy}/delete/${imgName}`);
      } catch (error) {
        console.log(error);
      }

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const data = await axios.get(`${proxy}/post/${orderOfPost}`);
    setPost(data.data[0]);
    setIsLoading(false);

    window.scrollTo(0, 0);
  };
  console.log(post);
  useEffect(() => {
    fetchData();
  }, [params.id]);

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

  //convert img path to only url
  function extractPublicID(url) {
    const regex = /^(.*\/)(Eartblogs\/.*)(\.\w+)$/;
    const match = url.match(regex);
    if (match) {
      return match[2].replace(/\//g, "%2F");
    } else {
      return null;
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-[1024px]">
        <div className="flex gap-[50px]">
          <div className="flex-[5]">
            <img
              src={post?.img}
              className="w-[100%] h-[350px] object-cover mt-[10px]"
            />
            <div className="flex items-center gap-[10px] text-[14px] mt-[25px]">
              <img
                src={post?.userImg}
                alt="profile"
                className="w-[50px] h-[50px] rounded-[50%] object-cover"
              />
              <div>
                <span className="font-bold">{post?.username}</span>
                <p>{moment(post?.date).fromNow()}</p>
              </div>
              {currentUser?.username === post?.username && (
                <div className="flex gap-[5px]">
                  <Link to={`/write?edit=${post?.id}`}>
                    <img
                      src={Edit}
                      alt="edit button"
                      className=" w-[20px] h-[20px] cursor-pointer"
                    />
                  </Link>
                  <img
                    src={Delete}
                    alt="delete button"
                    className=" w-[20px] h-[20px] cursor-pointer"
                    onClick={() => handleDelete(extractPublicID(post?.img))}
                  />
                </div>
              )}
            </div>
            <h1 className="text-[42px] text-[#333] font-bold my-[10px] p-[10px] break-words">
              {post?.title}
            </h1>
            <div className="max-w-3xl overflow-x-auto	  ">
              {Parser(`${post?.desc}`)}
            </div>
          </div>
          <Menu category={post?.category} orderOfPost={parseInt(orderOfPost)} />
        </div>
      </div>
    </div>
  );
};

export default Single;
