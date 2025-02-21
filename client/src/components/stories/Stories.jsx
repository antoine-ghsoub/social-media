import { useContext, useRef, useState } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  // Fetch stories from the backend
  const { isLoading, error, data } = useQuery(["stories"], () =>
    makeRequest.get("/stories").then((res) => res.data)
  );

  // Mutation to add a new story
  const addMutation = useMutation(
    (newStory) => makeRequest.post("/stories", newStory),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"]);
      },
    }
  );

  // Mutation to delete a story
  const deleteMutation = useMutation(
    (storyId) => makeRequest.delete("/stories/" + storyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"]);
        setSelectedStory(null);
      },
    }
  );

  // Upload file and return filename
  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  // Handle file input change (story creation)
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const uploadedFilename = await upload(selectedFile);
      addMutation.mutate({ img: uploadedFilename });
    }
  };

  // Trigger hidden file input when "+" button is clicked
  const handleAddStory = () => {
    fileInputRef.current.click();
  };

  // Open the modal with the selected story
  const handleStoryClick = (story) => {
    setSelectedStory(story);
  };

  // Delete the story and close the modal
  const handleDeleteStory = (storyId) => {
    deleteMutation.mutate(storyId);
  };

  // Close the modal
  const handleCloseModal = () => {
    setSelectedStory(null);
  };

  return (
    <div className="stories">
      <div className="story addStory">
        <img
          src={"/upload/" + currentUser.profilePic}
          alt=""
          className="smallProfile"
        />
        <button className="addButton" onClick={handleAddStory}>
          +
        </button>
        {/* Hidden file input for story creation */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : data.map((story) => (
            <div
              className="story"
              key={story.id}
              onClick={() => handleStoryClick(story)}
            >
              <img src={"/upload/" + story.img} alt="" />
            </div>
          ))}
      {selectedStory && (
        <div className="modal">
          <div className="modalContent">
            <CloseIcon className="closeIcon" onClick={handleCloseModal} />
            <img src={"/upload/" + selectedStory.img} alt="" />
            {selectedStory.userId === currentUser.id && (
              <DeleteOutlinedIcon
                className="deleteIcon"
                onClick={() => handleDeleteStory(selectedStory.id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
