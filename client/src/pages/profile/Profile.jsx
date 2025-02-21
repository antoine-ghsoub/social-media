import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useParams } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";
import NoAvatar from "../../assets/NoAvatar.png";

const Profile = () => {
  // Always call hooks at the top
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext);
  
  // Change: use "id" from URL params instead of "userId"
  const { id } = useParams();
  const numericUserId = id ? parseInt(id) : currentUser?.id;
  
  const queryClient = useQueryClient();

  // Fetch user data only if numericUserId exists
  const { isLoading, error, data } = useQuery(
    ["user", numericUserId],
    () =>
      makeRequest.get("/users/find/" + numericUserId).then((res) => res.data),
    { enabled: !!numericUserId }
  );

  // Fetch followers data
  const { isLoading: followersLoading, data: followersData } = useQuery(
    ["followers", numericUserId],
    () =>
      makeRequest
        .get("/relationships?followedUserId=" + numericUserId)
        .then((res) => res.data),
    { enabled: !!numericUserId }
  );

  // Fetch following data
  const { isLoading: followingLoading, data: followingData } = useQuery(
    ["following", numericUserId],
    () =>
      makeRequest
        .get("/relationships?followerUserId=" + numericUserId)
        .then((res) => res.data),
    { enabled: !!numericUserId }
  );

  // Check if the current user is following the profile user
  const isFollowing =
    followersData &&
    followersData.map((id) => Number(id)).includes(currentUser?.id);

  // Mutation for follow/unfollow action
  const mutation = useMutation(
    (following) => {
      if (following)
        return makeRequest.delete("/relationships?userId=" + numericUserId);
      return makeRequest.post("/relationships", { userId: numericUserId });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["followers", numericUserId]);
      },
    }
  );

  const handleFollow = () => {
    if (followersData) {
      mutation.mutate(isFollowing);
    }
  };

  // Render early if no currentUser or user id is available
  if (!currentUser) return <div>Please log in to view your profile.</div>;
  if (!numericUserId) return <div>Invalid user.</div>;
  if (isLoading) return <div>Loading...</div>;
  if (error)
    return <div>{error.response?.data || "An error occurred"}</div>;
  if (!data) return <div>User not found!</div>;

  return (
    <div className="profile">
      <div className="images">
        <img
          src={data.coverPic ? "/upload/" + data.coverPic : NoAvatar}
          alt="Cover"
          className="cover"
        />
        <img
          src={data.profilePic ? "/upload/" + data.profilePic : NoAvatar}
          alt="Profile"
          className="profilePic"
        />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
            <a href="http://facebook.com">
              <FacebookTwoToneIcon fontSize="large" />
            </a>
            <a href="http://instagram.com">
              <InstagramIcon fontSize="large" />
            </a>
            <a href="http://twitter.com">
              <TwitterIcon fontSize="large" />
            </a>
            <a href="http://linkedin.com">
              <LinkedInIcon fontSize="large" />
            </a>
            <a href="http://pinterest.com">
              <PinterestIcon fontSize="large" />
            </a>
          </div>
          <div className="center">
            <span>{data.name}</span>
            <div className="info">
              <div className="item">
                <PlaceIcon />
                <span>{data.city}</span>
              </div>
              <div className="item">
                <LanguageIcon />
                <span>{data.website}</span>
              </div>
            </div>
            {followersLoading ? (
              "loading"
            ) : numericUserId === currentUser.id ? (
              <button onClick={() => setOpenUpdate(true)}>
                Update Profile
              </button>
            ) : (
              <button onClick={handleFollow}>
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
            <div className="counts">
              <span>
                Followers:{" "}
                {followersLoading ? "..." : followersData?.length || 0}
              </span>
              <span>
                Following:{" "}
                {followingLoading ? "..." : followingData?.length || 0}
              </span>
            </div>
          </div>
          <div className="right">
            <EmailOutlinedIcon />
            <MoreVertIcon />
          </div>
        </div>
        {/* Pass numericUserId to Posts */}
        <Posts userId={numericUserId} />
      </div>
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;
