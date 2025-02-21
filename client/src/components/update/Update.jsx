import { useState, useContext } from "react";
import { makeRequest } from "../../axios";
import "./update.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import NoAvatar from "../../assets/NoAvatar.png";
import { AuthContext } from "../../context/authContext";

const Update = ({ setOpenUpdate, user }) => {
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [deleteCover, setDeleteCover] = useState(false);
  const [deleteProfile, setDeleteProfile] = useState(false);
  const [texts, setTexts] = useState({
    name: user.name,
    city: user.city || "",
    website: user.website || "",
  });

  // Pull currentUser and setCurrentUser from AuthContext
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Function to upload a file and return the filename
  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data; // assuming backend returns the filename
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // Update texts state when inputs change
  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Use the correct endpoint for updating the user (no ID in URL)
  const mutation = useMutation(
    (updatedUser) => {
      return makeRequest.put("/users", updatedUser);
    },
    {
      onSuccess: (data, variables) => {
        // Update currentUser with the new information.
        setCurrentUser({
          ...currentUser,
          name: variables.name,
          city: variables.city,
          website: variables.website,
          coverPic: variables.coverPic,
          profilePic: variables.profilePic,
        });
        queryClient.invalidateQueries(["user"]);
      },
    }
  );

  // Handle form submission
  const handleClick = async (e) => {
    e.preventDefault();

    // Determine coverUrl
    let coverUrl = "";
    if (deleteCover) {
      coverUrl = ""; // User chose to delete cover image
    } else if (cover) {
      coverUrl = await upload(cover);
    } else {
      coverUrl = user.coverPic || "";
    }

    // Determine profileUrl
    let profileUrl = "";
    if (deleteProfile) {
      profileUrl = ""; // User chose to delete profile image
    } else if (profile) {
      profileUrl = await upload(profile);
    } else {
      profileUrl = user.profilePic || "";
    }

    // Send updated user data
    mutation.mutate({ ...texts, coverPic: coverUrl, profilePic: profileUrl });

    // Close modal and reset file/deletion states
    setOpenUpdate(false);
    setCover(null);
    setProfile(null);
    setDeleteCover(false);
    setDeleteProfile(false);
  };

  return (
    <div className="update">
      <div className="wrapper">
        <h1>Update Your Profile</h1>
        <form>
          <div className="files">
            {/* Cover Picture */}
            <label htmlFor="cover">
              <span>Cover Picture</span>
              <div className="imgContainer">
                <img
                  src={
                    cover
                      ? URL.createObjectURL(cover)
                      : deleteCover
                      ? NoAvatar
                      : user.coverPic
                      ? "/upload/" + user.coverPic
                      : NoAvatar
                  }
                  alt="Cover"
                />
                <CloudUploadIcon className="icon" />
                {(cover || user.coverPic) && !deleteCover && (
                  <DeleteOutlineIcon
                    className="deleteIcon"
                    onClick={() => {
                      setDeleteCover(true);
                      setCover(null);
                    }}
                  />
                )}
                {deleteCover && <span className="deleted">Deleted</span>}
              </div>
            </label>
            <input
              type="file"
              id="cover"
              style={{ display: "none" }}
              onChange={(e) => {
                setCover(e.target.files[0]);
                setDeleteCover(false);
              }}
            />

            {/* Profile Picture */}
            <label htmlFor="profile">
              <span>Profile Picture</span>
              <div className="imgContainer">
                <img
                  src={
                    profile
                      ? URL.createObjectURL(profile)
                      : deleteProfile
                      ? NoAvatar
                      : user.profilePic
                      ? "/upload/" + user.profilePic
                      : NoAvatar
                  }
                  alt="Profile"
                />
                <CloudUploadIcon className="icon" />
                {(profile || user.profilePic) && !deleteProfile && (
                  <DeleteOutlineIcon
                    className="deleteIcon"
                    onClick={() => {
                      setDeleteProfile(true);
                      setProfile(null);
                    }}
                  />
                )}
                {deleteProfile && <span className="deleted">Deleted</span>}
              </div>
            </label>
            <input
              type="file"
              id="profile"
              style={{ display: "none" }}
              onChange={(e) => {
                setProfile(e.target.files[0]);
                setDeleteProfile(false);
              }}
            />
          </div>
          <label>Name</label>
          <input
            type="text"
            value={texts.name}
            name="name"
            onChange={handleChange}
          />
          <label>Country / City</label>
          <input
            type="text"
            name="city"
            value={texts.city}
            onChange={handleChange}
          />
          <label>Website</label>
          <input
            type="text"
            name="website"
            value={texts.website}
            onChange={handleChange}
          />
          <button onClick={handleClick}>Update</button>
        </form>
        <button className="close" onClick={() => setOpenUpdate(false)}>
          close
        </button>
      </div>
    </div>
  );
};

export default Update;
