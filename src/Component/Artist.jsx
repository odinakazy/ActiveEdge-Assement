import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Artist.css";
import Engageimg from "../assets/Engage.png";

function Artist() {
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedTweetId, setSelectedTweetId] = useState(null);

  const [newTweets, setNewTweets] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // fetch artists
    const fetchArtists = async () => {
      try {
        const response = await axios.get(
          "https://jsonplaceholder.typicode.com/users"
        );
        setArtists(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    // Fetch albums
    const fetchAlbums = async () => {
      try {
        const response = await axios.get(
          "https://jsonplaceholder.typicode.com/albums"
        );
        setAlbums(response.data);
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };

    // Fetch tweets
    const fetchTweets = async () => {
      try {
        const response = await axios.get(
          "https://jsonplaceholder.typicode.com/comments"
        );
        setTweets(response.data);
      } catch (error) {
        console.error("Error fetching tweets:", error);
      }
    };

    fetchArtists();
    fetchAlbums();
    fetchTweets();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Function to get albums for a specific artist
  const getAlbumsForArtist = (artistId) => {
    return albums.filter((album) => album.userId === artistId);
  };

  // Function to get tweets for a specific artist
  const getTweetsForArtist = (artistId) => {
    return tweets.filter((tweet) => tweet.postId === artistId);
  };

  // Function to toggle the display of albums
  const toggleAlbums = (artistId) => {
    setSelectedArtistId(selectedArtistId === artistId ? null : artistId);
    setSelectedTweetId(null); // Close tweets when albums are toggled
  };

  // Function to toggle the display of tweets
  const toggleTweets = (artistId) => {
    setSelectedTweetId(selectedTweetId === artistId ? null : artistId);
  };

  // Handle input changes and validate
  const handleInputChange = (e, artistId) => {
    const { name, value } = e.target;
    setNewTweets((prevState) => ({
      ...prevState,
      [artistId]: {
        ...prevState[artistId],
        [name]: value,
      },
    }));

    // Validate input while typing
    let errors = validationErrors[artistId] || {};
    switch (name) {
      case "name":
        errors.name =
          value.length < 3 ? "Name must be at least 3 characters" : "";
        break;
      case "email":
        errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Email is not valid";
        break;
      case "body":
        errors.body =
          value.length < 10 ? "Body must be at least 10 characters" : "";
        break;
      default:
        break;
    }
    setValidationErrors((prevState) => ({
      ...prevState,
      [artistId]: errors,
    }));
  };

  // Check if the form is valid
  const isFormValid = (artistId) => {
    const errors = validationErrors[artistId] || {};
    const tweet = newTweets[artistId] || {};
    return (
      !errors.name &&
      !errors.email &&
      !errors.body &&
      tweet.name &&
      tweet.email &&
      tweet.body
    );
  };

  // Handle form submission
  const handleSubmit = async (e, artistId) => {
    e.preventDefault();
    if (!isFormValid(artistId)) return;

    try {
      const response = await axios.post(
        "https://jsonplaceholder.typicode.com/comments",
        {
          ...newTweets[artistId],
          postId: artistId,
        }
      );
      setTweets([...tweets, response.data]);
      setNewTweets((prevState) => ({
        ...prevState,
        [artistId]: { name: "", email: "", body: "" },
      }));
      setValidationErrors((prevState) => ({
        ...prevState,
        [artistId]: { name: "", email: "", body: "" },
      }));
    } catch (error) {
      console.error("Error posting tweet:", error);
    }
  };

  return (
    <div className="artists-container">
      <h1>Chocolate City Artists</h1>
      <div className="artists-list">
        {artists.map((artist) => (
          <div key={artist.id} className="artist-card">
            <h2>{artist.name}</h2>
            <div className="flex-item1">
              <p>
                <span className="bold">Email:</span> {artist.email}
              </p>
              <p>
                <span className="bold">City:</span> {artist.address.city}
              </p>
            </div>
            <div className="flex-item2">
              <p>
                <span className="bold">Phone: </span>
                {artist.phone}
              </p>
              <p>
                <span className="bold">Website:</span> {artist.website}
              </p>
            </div>
            <h3
              onClick={() => toggleAlbums(artist.id)}
              className="albums-toggle"
            >
              View albums
            </h3>
            <h3
              onClick={() => toggleTweets(artist.id)}
              className="tweets-toggle"
            >
              View tweets
            </h3>
            {selectedArtistId === artist.id && (
              <div className="albums-container">
                {getAlbumsForArtist(artist.id).map((album) => (
                  <div key={album.id} className="album-card">
                    <img src={Engageimg} className="album-image" />
                    <p>{album.title}</p>
                  </div>
                ))}
              </div>
            )}
            {selectedTweetId === artist.id && (
              <div className="tweets-container">
                {getTweetsForArtist(artist.id).map((tweet) => (
                  <div key={tweet.id} className="tweet-card">
                    <div className="tweet-header">
                      <h4>{tweet.name}</h4>
                      <p>{tweet.email}</p>
                    </div>
                    <div className="tweet-body">
                      <p>{tweet.body}</p>
                    </div>
                  </div>
                ))}
                <form
                  className="tweet-form"
                  onSubmit={(e) => handleSubmit(e, artist.id)}
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={newTweets[artist.id]?.name || ""}
                    onChange={(e) => handleInputChange(e, artist.id)}
                  />
                  {validationErrors[artist.id]?.name && (
                    <div className="error-message">
                      {validationErrors[artist.id].name}
                    </div>
                  )}
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newTweets[artist.id]?.email || ""}
                    onChange={(e) => handleInputChange(e, artist.id)}
                  />
                  {validationErrors[artist.id]?.email && (
                    <div className="error-message">
                      {validationErrors[artist.id].email}
                    </div>
                  )}
                  <textarea
                    name="body"
                    placeholder="Tweet"
                    value={newTweets[artist.id]?.body || ""}
                    onChange={(e) => handleInputChange(e, artist.id)}
                  />
                  {validationErrors[artist.id]?.body && (
                    <div className="error-message">
                      {validationErrors[artist.id].body}
                    </div>
                  )}
                  <button type="submit" disabled={!isFormValid(artist.id)}>
                    Post Tweet
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Artist;
