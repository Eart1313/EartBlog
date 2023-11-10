import React, { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import moment from "moment-timezone";
import { useAuth } from "../contexts/authContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const Write = () => {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [img, setImg] = useState(null);
  const [category, setCategory] = useState("");
  const [errMes, setErrMes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { proxy, currentUser } = useAuth();
  const navigate = useNavigate();

  //imgurl from original post
  const [editImg, setEditImg] = useState(null);
  // url old img to delete
  const [imgToDelete, setImgToDelete] = useState(null);
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

  const [searchParams] = useSearchParams();
  const edit = searchParams.get("edit");

  const fetchDataToEdit = async () => {
    try {
      const { data } = await axios.get(`${proxy}/post/${edit}`);
      setTitle(data[0].title);
      setValue(data[0].desc);
      setCategory(data[0].category);
      setEditImg(data[0].img);
      setImgToDelete(data[0].img);
      setImg(data[0].img);
    } catch (error) {
      console.log(error);
    }
  };

  const upload = async (e) => {
    const formData = new FormData();
    formData.append("test", img);
    try {
      const response = await axios.post(`${proxy}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.file.path;
    } catch (error) {
      console.log(error);
    }
    return null;
  };

  // convert html tag in quill filter only text
  function stripHtmlTags(input) {
    return input.replace(/(<([^>]+)>)/gi, "");
  }

  function checkContentSize(value) {
    const SizeInByte = new Blob([JSON.stringify(value)]).size;
    const SizeInMb = Math.ceil(SizeInByte / 1_048_576);
    return SizeInMb;
  }

  const notAuthen = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = moment();
    const formattedDateTime = currentDate.format("YYYY-MM-DD HH:mm:ss");
    if (!stripHtmlTags(value) || !title) {
      setErrMes("*Please fill all fields!");
      return;
    } else if (title.length > 255) {
      setErrMes(`*Title must not exceed 255 characters!(${title.length})`);
      return;
    } else if (stripHtmlTags(value).length > 2500) {
      setErrMes(
        `*Content must not exceed 2500 characters!(${
          stripHtmlTags(value).length
        })`
      );
      return;
    } else if (checkContentSize(value) > 10) {
      // validate file size
      setErrMes(
        `*The content size is limited to 10MB. (${checkContentSize(value)} MB)`
      );
      return;
    }
    if (!category) {
      setErrMes("*Please select category!");
      return;
    }

    if (!img) {
      setErrMes("*please upload an image!");
      return;
    } else if (Math.ceil(img?.size / 1_048_576) > 5) {
      setErrMes(
        `*The image size is limited to 5MB. (${Math.ceil(
          img?.size / 1_048_576
        )} MB)`
      );
      return;
    }

    if (
      editImg === null &&
      img?.type !== "image/png" &&
      img?.type !== "image/jpeg"
    ) {
      setErrMes(`*The image must be PNG or JPEG file`);
      return;
    }

    if (edit) {
      try {
        setIsLoading(true);
        if (!editImg) {
          const uploadedImgUrl = await upload();
          if (!uploadedImgUrl) {
            setIsLoading(false);
            setErrMes("Failed to upload image.");
            return;
          }

          try {
            const body = {
              title,
              desc: value,
              imgUrl: uploadedImgUrl,
              category,
            };

            await axios.put(`${proxy}/post/${edit}`, body, {
              withCredentials: true,
            });

            try {
              await axios.delete(
                `${proxy}/delete/${extractPublicID(imgToDelete)}`
              );
            } catch (error) {
              console.log(error);
            }
            setTimeout(() => {
              navigate("/");
            }, 1500);
          } catch (error) {
            console.log(error);
            setErrMes("*Failed to update!");
          }
          return;
        }

        const body = {
          title,
          desc: value,
          imgUrl: img,
          category,
        };

        await axios.put(`${proxy}/post/${edit}`, body, {
          withCredentials: true,
        });

        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (error) {
        console.log(error);
        setErrMes("*Failed to update!");
      }
    } else {
      try {
        setIsLoading(true);
        const uploadedImgUrl = await upload();
        if (!uploadedImgUrl) {
          setIsLoading(false);
          setErrMes("Failed to upload image.");
          return;
        }
        const body = {
          title,
          desc: value,
          imgUrl: uploadedImgUrl,
          date: formattedDateTime,
          category,
        };
        await axios.post(`${proxy}/post`, body, {
          withCredentials: true,
        });
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (error) {
        console.log(error);
        setErrMes("*Failed to post!");
        setIsLoading(false);
      }
    }
  };

  const quillConfig = {
    modules: {
      toolbar: {
        container: [
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline"],
          [{ align: [] }],
          ["image", "video"],
        ],
        handlers: {},
      },
    },
    theme: "snow",
  };

  useEffect(() => {
    if (edit) {
      fetchDataToEdit();
    }
  }, [edit]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[69vh]">
        <div className="animate-spin rounded-full h-[100px] w-[100px] border-t-[6px] border-[#b9e7e7] border-solid"></div>
        <div className="mt-[50px] text-[#0a9c9c]">
          Uploading<span className="dots"></span>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[69vh]">
        <div className="flex flex-col items-center">
          <div className="rounded-full h-[100px] w-[100px] bg-[#0a9c9c] relative">
            <div className="checkmark"></div>
          </div>
          <div className="mt-[50px] text-[#0a9c9c]">Upload successfully</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-[69vh]">
      <div className="w-[1024px]">
        {img && (
          <div className="flex justify-center my-[25px] ">
            <div className="relative">
              <img
                className="h-[350px] relative"
                src={editImg ? editImg : URL.createObjectURL(img)}
                alt="Selected Image"
              />

              <div
                className="flex justify-center items-center font-semibold m-[10px] cursor-pointer text-[#b9e7e7] bg-[#21a0a0] w-[30px] h-[30px] rounded-full absolute top-[0] right-[0]"
                onClick={() => {
                  setImg(null);
                  setEditImg(null);
                }}>
                X
              </div>
            </div>
          </div>
        )}
        <div className="add flex mt-[20px] gap-[20px]">
          <div className="content flex flex-col gap-[20px] flex-[5]">
            <input
              value={title}
              placeholder="title"
              className="p-[10px] border-[1px] border-[lightgray]  focus:outline-none focus:border-[teal] focus:ring-1 focus:ring-[teal]"
              onChange={(e) => setTitle(e.target.value)}
              onClick={!currentUser ? notAuthen : undefined}
            />  
            <div
              className="min-h-[69vh]"
              onClick={!currentUser ? notAuthen : undefined}>
              <ReactQuill
                className="h-[100%] max-w-[715px] border-none border-[1px] border-[lightgray]"
                theme="snow"
                value={value}
                onChange={setValue}
                modules={quillConfig.modules}
                placeholder="your content"
              />
            </div>
          </div>
          <div className="menu flex-[2] flex flex-col gap-[20px]">
            <div className="max-h-40 flex flex-col justify-between flex-1 border-[1px] border-[lightgray] p-[10px]">
              <h1 className="text-[18px] font-medium">Publish</h1>
              <span>
                <b>Status: </b> Draft
              </span>
              <span>
                <b>Visibility: </b> Public
              </span>
              <input
                type="file"
                className="hidden"
                id="file"
                onChange={(e) => {
                  setImg(e.target.files[0]);
                  setEditImg(null);
                }}
                disabled={!currentUser}
              />
              <label
                htmlFor="file"
                className="cursor-pointer underline text-teal-800 mb-[10px]">
                Upload Image
              </label>
              <div className="flex justify-between">
                <button
                  onClick={() => setErrMes("Available soon!")}
                  className="cursor-pointer text-[teal] bg-[white] border-[1px] border-[teal] py-[3px] px-[5px]">
                  Save as a draft
                </button>
                <button
                  onClick={!currentUser ? notAuthen : handleSubmit}
                  className="cursor-pointer text-[white] bg-[teal] border-[1px] border-[teal] py-[3px] px-[5px]">
                  Publish
                </button>
              </div>
            </div>
            <div className="max-h-48 text-[teal] flex flex-col justify-between flex-1 border-[1px] border-[lightgray] p-[10px]">
              <h1 className="text-[18px] font-medium text-[black]">Category</h1>
              <div>
                <input
                  type="radio"
                  name="cate"
                  value="art"
                  id="art"
                  onChange={(e) => setCategory(e.target.value)}
                  checked={category === "art"}
                />
                <label className="pl-[10px]" htmlFor="art">
                  Art
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="cate"
                  value="science"
                  id="science"
                  onChange={(e) => setCategory(e.target.value)}
                  checked={category === "science"}
                />
                <label className="pl-[10px]" htmlFor="science">
                  Science
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="cate"
                  value="technology"
                  id="technology"
                  onChange={(e) => setCategory(e.target.value)}
                  checked={category === "technology"}
                />
                <label className="pl-[10px]" htmlFor="technology">
                  Technology
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="cate"
                  value="cinema"
                  id="cinema"
                  onChange={(e) => setCategory(e.target.value)}
                  checked={category === "cinema"}
                />
                <label className="pl-[10px]" htmlFor="cinema">
                  Cinema
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="cate"
                  value="design"
                  id="design"
                  onChange={(e) => setCategory(e.target.value)}
                  checked={category === "design"}
                />
                <label className="pl-[10px]" htmlFor="design">
                  Design
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="cate"
                  value="food"
                  id="food"
                  onChange={(e) => setCategory(e.target.value)}
                  checked={category === "food"}
                />
                <label className="pl-[10px]" htmlFor="food">
                  Food
                </label>
              </div>
            </div>
            {errMes && (
              <div className="text-[1rem] text-[red] self-end">{errMes}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Write;
