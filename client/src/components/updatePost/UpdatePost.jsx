import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./updatePost.scss";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const UpdatePost = ({ post, setOpenUpdatePost }) => {
  const [desc, setDesc] = useState(post.desc);
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  // Function to upload a file and return its filename
  const upload = async () => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const mutation = useMutation(
    async (updatedPost) => {
      return await makeRequest.put("/posts/" + post.id, updatedPost);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"]);
        setOpenUpdatePost(false);
      },
    }
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    let imgUrl = post.img; // use existing image by default
    if (file) {
      imgUrl = await upload();
    }
    mutation.mutate({ desc, img: imgUrl });
  };

  return (
    <div className="updatePost">
      <div className="wrapper">
        <h1>Edit Post</h1>
        <form>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What's on your mind?"
          />
          <div className="fileSection">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="uploadItem">
                <CloudUploadIcon className="icon" />
                <span>Change Image</span>
              </div>
            </label>
            {file && (
              <div className="preview">
                <img src={URL.createObjectURL(file)} alt="preview" />
                <DeleteOutlineIcon
                  className="deleteIcon"
                  onClick={() => setFile(null)}
                />
              </div>
            )}
          </div>
          <button onClick={handleUpdate}>Update</button>
          <button onClick={() => setOpenUpdatePost(false)}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePost;
