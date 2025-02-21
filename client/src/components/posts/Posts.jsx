import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Posts = ({ userId }) => {
  console.log("Posts: Received userId =", userId);

  const { isLoading, error, data } = useQuery(["posts", userId], () =>
    makeRequest
      .get(userId ? `/posts?userId=${userId}` : "/posts")
      .then((res) => res.data)
  );

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Something went wrong!</div>;

  return (
    <div className="posts">
      {data.map((post, index) => (
        <Post post={post} key={`${post.id}-${index}`} />
      ))}
    </div>
  );
};

export default Posts;
