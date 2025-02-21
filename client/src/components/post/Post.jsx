import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState, useContext } from "react";
import moment from "moment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import NoAvatar from "../../assets/NoAvatar.png";
import UpdatePost from "../updatePost/UpdatePost"; // NEW: Import the UpdatePost component

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [updatePostOpen, setUpdatePostOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  // Fetch likes for this post
  const { isLoading, error, data: likesData } = useQuery(
    ["likes", post.id],
    () => makeRequest.get("/likes?postId=" + post.id).then((res) => res.data)
  );

  // Fetch comment count for this post
  const { data: commentsData } = useQuery(
    ["comments", post.id],
    () => makeRequest.get("/comments?postId=" + post.id).then((res) => res.data),
    { select: (data) => data.length }
  );

  const queryClient = useQueryClient();

  const likeMutation = useMutation(
    (liked) => {
      if (liked) return makeRequest.delete("/likes?postId=" + post.id);
      return makeRequest.post("/likes", { postId: post.id });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["likes", post.id]);
      },
    }
  );

  const deleteMutation = useMutation(
    (postId) => {
      return makeRequest.delete("/posts/" + postId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const handleLike = () => {
    likeMutation.mutate(likesData.includes(currentUser.id));
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
  };

  const handleShare = async () => {
    try {
      const postUrl = window.location.origin + "/post/" + post.id;
      await navigator.clipboard.writeText(postUrl);
      alert("Post link copied to clipboard!");
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img
              src={post.profilePic ? "/upload/" + post.profilePic : NoAvatar}
              alt=""
            />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name}</span>
              </Link>
              <span className="date">{moment(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {menuOpen && post.userId === currentUser.id && (
            <div className="menuOptions">
              <button onClick={() => setUpdatePostOpen(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
        <div className="content">
          <p>{post.desc}</p>
          {post.img && <img src={"/upload/" + post.img} alt="" />}
        </div>
        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) : likesData.includes(currentUser.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red", cursor: "pointer" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon
                style={{ cursor: "pointer" }}
                onClick={handleLike}
              />
            )}
            {likesData?.length} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon style={{ cursor: "pointer" }} />
            {commentsData} Comments
          </div>
          <div className="item" onClick={handleShare}>
            <ShareOutlinedIcon style={{ cursor: "pointer" }} />
            Share
          </div>
        </div>
        {commentOpen && <Comments postId={post.id} />}
      </div>
      {/* Render the UpdatePost modal if open */}
      {updatePostOpen && (
        <UpdatePost post={post} setOpenUpdatePost={setUpdatePostOpen} />
      )}
    </div>
  );
};

export default Post;
