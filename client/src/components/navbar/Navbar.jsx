import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import NoAvatar from "../../assets/NoAvatar.png";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Query to search users when searchTerm is non-empty
  const { data: searchResults, refetch } = useQuery(
    ["userSearch", searchTerm],
    () =>
      makeRequest
        .get("/users/search?query=" + searchTerm)
        .then((res) => res.data),
    { enabled: false }
  );

  // Trigger search when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      refetch();
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchTerm, refetch]);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>lamasocial</span>
        </Link>
        <Link to="/" style={{ color: "inherit" }}>
          <HomeOutlinedIcon style={{ cursor: "pointer" }} />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
        )}
        <GridViewOutlinedIcon />
        <div className="search">
          <SearchOutlinedIcon />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {showDropdown && searchResults && (
            <div className="searchDropdown">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="searchItem"
                    onClick={() => {
                      navigate(`/profile/${user.id}`);
                      setSearchTerm("");
                      setShowDropdown(false);
                    }}
                  >
                    <img
                      src={
                        user.profilePic
                          ? "/upload/" + user.profilePic
                          : NoAvatar
                      }
                      alt="user"
                    />
                    <span>{user.name}</span>
                  </div>
                ))
              ) : (
                <div className="searchItem">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="right">
        <PersonOutlinedIcon />
        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <Link
          to={`/profile/${currentUser.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="user">
            <img
              src={
                currentUser.profilePic
                  ? "/upload/" + currentUser.profilePic
                  : NoAvatar
              }
              alt=""
            />
            <span>{currentUser.name}</span>
          </div>
        </Link>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
