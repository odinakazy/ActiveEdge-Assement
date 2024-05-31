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
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [newTweets, setNewTweets] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
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

    const fetchTweets = async () => {
      try {
        const storedTweets = JSON.parse(localStorage.getItem("tweets"));
        if (storedTweets && storedTweets.length > 0) {
          setTweets(storedTweets);
        } else {
          const response = await axios.get(
            "https://jsonplaceholder.typicode.com/comments"
          );
          setTweets(response.data);
          localStorage.setItem("tweets", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching tweets:", error);
      }
    };

    fetchArtists();
    fetchAlbums();
    fetchTweets();
  }, []);

  useEffect(() => {
    localStorage.setItem("tweets", JSON.stringify(tweets));
  }, [tweets]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const getAlbumsForArtist = (artistId) => {
    return albums.filter((album) => album.userId === artistId);
  };

  const getTweetsForArtist = (artistId) => {
    return tweets.filter((tweet) => tweet.postId === artistId);
  };

  const toggleAlbums = (artistId) => {
    setSelectedArtistId(selectedArtistId === artistId ? null : artistId);
    setSelectedTweetId(null);
  };

  const toggleTweets = (artistId) => {
    setSelectedTweetId(selectedTweetId === artistId ? null : artistId);
  };

  const handleInputChange = (e, artistId) => {
    const { name, value } = e.target;
    setNewTweets((prevState) => ({
      ...prevState,
      [artistId]: {
        ...prevState[artistId],
        [name]: value,
      },
    }));

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

  const handleSubmit = (e, artistId) => {
    e.preventDefault();
    if (!isFormValid(artistId)) return;

    const newTweet = {
      ...newTweets[artistId],
      postId: artistId,
      id: tweets.length + 1,
    };

    const updatedTweets = [...tweets, newTweet];
    setTweets(updatedTweets);

    setNewTweets((prevState) => ({
      ...prevState,
      [artistId]: { name: "", email: "", body: "" },
    }));
    setValidationErrors((prevState) => ({
      ...prevState,
      [artistId]: { name: "", email: "", body: "" },
    }));
  };

  const handleUpdate = (e, artistId, tweetId) => {
    e.preventDefault();
    if (!isFormValid(artistId)) return;

    const updatedTweet = {
      ...newTweets[artistId],
      postId: artistId,
      id: tweetId,
    };

    const updatedTweets = tweets.map((tweet) =>
      tweet.id === tweetId ? updatedTweet : tweet
    );
    setTweets(updatedTweets);

    setEditingTweetId(null);
    setNewTweets((prevState) => ({
      ...prevState,
      [artistId]: { name: "", email: "", body: "" },
    }));
    setValidationErrors((prevState) => ({
      ...prevState,
      [artistId]: { name: "", email: "", body: "" },
    }));
  };

  const handleEdit = (tweet) => {
    setEditingTweetId(tweet.id);
    setNewTweets((prevState) => ({
      ...prevState,
      [tweet.postId]: {
        name: tweet.name,
        email: tweet.email,
        body: tweet.body,
      },
    }));
  };

  const handleDelete = (tweetId) => {
    const updatedTweets = tweets.filter((tweet) => tweet.id !== tweetId);
    setTweets(updatedTweets);
    localStorage.setItem("tweets", JSON.stringify(updatedTweets));
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
                    <button onClick={() => handleEdit(tweet)}>Edit</button>
                    <button onClick={() => handleDelete(tweet.id)}>
                      Delete
                    </button>
                  </div>
                ))}
                {editingTweetId === null && (
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
                      <p className="error">
                        {validationErrors[artist.id]?.name}
                      </p>
                    )}
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={newTweets[artist.id]?.email || ""}
                      onChange={(e) => handleInputChange(e, artist.id)}
                    />
                    {validationErrors[artist.id]?.email && (
                      <p className="error">
                        {validationErrors[artist.id]?.email}
                      </p>
                    )}
                    <textarea
                      name="body"
                      placeholder="Body"
                      value={newTweets[artist.id]?.body || ""}
                      onChange={(e) => handleInputChange(e, artist.id)}
                    />
                    {validationErrors[artist.id]?.body && (
                      <p className="error">
                        {validationErrors[artist.id]?.body}
                      </p>
                    )}
                    <button type="submit">Submit</button>
                  </form>
                )}
                {editingTweetId && (
                  <form
                    className="tweet-form"
                    onSubmit={(e) => handleUpdate(e, artist.id, editingTweetId)}
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={newTweets[artist.id]?.name || ""}
                      onChange={(e) => handleInputChange(e, artist.id)}
                    />
                    {validationErrors[artist.id]?.name && (
                      <p className="error">
                        {validationErrors[artist.id]?.name}
                      </p>
                    )}
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={newTweets[artist.id]?.email || ""}
                      onChange={(e) => handleInputChange(e, artist.id)}
                    />
                    {validationErrors[artist.id]?.email && (
                      <p className="error">
                        {validationErrors[artist.id]?.email}
                      </p>
                    )}
                    <textarea
                      name="body"
                      placeholder="Body"
                      value={newTweets[artist.id]?.body || ""}
                      onChange={(e) => handleInputChange(e, artist.id)}
                    />
                    {validationErrors[artist.id]?.body && (
                      <p className="error">
                        {validationErrors[artist.id]?.body}
                      </p>
                    )}
                    <button type="submit">Update</button>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Artist;

//import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./Artist.css";
// import Engageimg from "../assets/Engage.png";

// function Artist() {
//   const [artists, setArtists] = useState([]);
//   const [albums, setAlbums] = useState([]);
//   const [tweets, setTweets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedArtistId, setSelectedArtistId] = useState(null);
//   const [selectedTweetId, setSelectedTweetId] = useState(null);
//   const [editingTweetId, setEditingTweetId] = useState(null);
//   const [newTweets, setNewTweets] = useState({});
//   const [validationErrors, setValidationErrors] = useState({});

//   useEffect(() => {
//     const fetchArtists = async () => {
//       try {
//         const response = await axios.get(
//           "https://jsonplaceholder.typicode.com/users"
//         );
//         setArtists(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err);
//         setLoading(false);
//       }
//     };

//     const fetchAlbums = async () => {
//       try {
//         const response = await axios.get(
//           "https://jsonplaceholder.typicode.com/albums"
//         );
//         setAlbums(response.data);
//       } catch (error) {
//         console.error("Error fetching albums:", error);
//       }
//     };

//     const fetchTweets = async () => {
//       try {
//         const response = await axios.get(
//           "https://jsonplaceholder.typicode.com/comments"
//         );
//         setTweets(response.data);
//       } catch (error) {
//         console.error("Error fetching tweets:", error);
//       }
//     };

//     fetchArtists();
//     fetchAlbums();
//     fetchTweets();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   const getAlbumsForArtist = (artistId) => {
//     return albums.filter((album) => album.userId === artistId);
//   };

//   const getTweetsForArtist = (artistId) => {
//     return tweets.filter((tweet) => tweet.postId === artistId);
//   };

//   const toggleAlbums = (artistId) => {
//     setSelectedArtistId(selectedArtistId === artistId ? null : artistId);
//     setSelectedTweetId(null);
//   };

//   const toggleTweets = (artistId) => {
//     setSelectedTweetId(selectedTweetId === artistId ? null : artistId);
//   };

//   const handleInputChange = (e, artistId) => {
//     const { name, value } = e.target;
//     setNewTweets((prevState) => ({
//       ...prevState,
//       [artistId]: {
//         ...prevState[artistId],
//         [name]: value,
//       },
//     }));

//     let errors = validationErrors[artistId] || {};
//     switch (name) {
//       case "name":
//         errors.name =
//           value.length < 3 ? "Name must be at least 3 characters" : "";
//         break;
//       case "email":
//         errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
//           ? ""
//           : "Email is not valid";
//         break;
//       case "body":
//         errors.body =
//           value.length < 10 ? "Body must be at least 10 characters" : "";
//         break;
//       default:
//         break;
//     }
//     setValidationErrors((prevState) => ({
//       ...prevState,
//       [artistId]: errors,
//     }));
//   };

//   const isFormValid = (artistId) => {
//     const errors = validationErrors[artistId] || {};
//     const tweet = newTweets[artistId] || {};
//     return (
//       !errors.name &&
//       !errors.email &&
//       !errors.body &&
//       tweet.name &&
//       tweet.email &&
//       tweet.body
//     );
//   };

//   const handleSubmit = async (e, artistId) => {
//     e.preventDefault();
//     if (!isFormValid(artistId)) return;

//     try {
//       const response = await axios.post(
//         "https://jsonplaceholder.typicode.com/comments",
//         {
//           ...newTweets[artistId],
//           postId: artistId,
//         }
//       );
//       // Ensure the new tweet has a unique ID
//       console.log(response);
//       const newTweet = { ...response.data, id: tweets.length + 1 };
//       setTweets([...tweets, newTweet]);
//       setNewTweets((prevState) => ({
//         ...prevState,
//         [artistId]: { name: "", email: "", body: "" },
//       }));
//       setValidationErrors((prevState) => ({
//         ...prevState,
//         [artistId]: { name: "", email: "", body: "" },
//       }));
//     } catch (error) {
//       console.error("Error posting tweet:", error);
//     }
//   };

//   const handleUpdate = async (e, artistId, tweetId) => {
//     e.preventDefault();
//     if (!isFormValid(artistId)) return;

//     const tweetData = {
//       postId: artistId,
//       id: tweetId,
//       name: newTweets[artistId]?.name || "",
//       email: newTweets[artistId]?.email || "",
//       body: newTweets[artistId]?.body || "",
//     };

//     try {
//       const response = await axios.put(
//         `https://jsonplaceholder.typicode.com/comments/${tweetId}`,
//         tweetData
//       );
//       setTweets((prevTweets) =>
//         prevTweets.map((tweet) =>
//           tweet.id === tweetId ? { ...response.data, postId: artistId } : tweet
//         )
//       );
//       //   setEditingTweetId(null);
//       setNewTweets((prevState) => ({
//         ...prevState,
//         [artistId]: { name: "", email: "", body: "" },
//       }));
//       setValidationErrors((prevState) => ({
//         ...prevState,
//         [artistId]: { name: "", email: "", body: "" },
//       }));
//     } catch (error) {
//       console.error("Error updating tweet:", error);
//     }
//   };

//   const handleEdit = (tweet) => {
//     setEditingTweetId(tweet.id);
//     setNewTweets((prevState) => ({
//       ...prevState,
//       [tweet.postId]: {
//         name: tweet.name,
//         email: tweet.email,
//         body: tweet.body,
//       },
//     }));
//   };

//   return (
//     <div className="artists-container">
//       <h1>Chocolate City Artists</h1>
//       <div className="artists-list">
//         {artists.map((artist) => (
//           <div key={artist.id} className="artist-card">
//             <h2>{artist.name}</h2>
//             <div className="flex-item1">
//               <p>
//                 <span className="bold">Email:</span> {artist.email}
//               </p>
//               <p>
//                 <span className="bold">City:</span> {artist.address.city}
//               </p>
//             </div>
//             <div className="flex-item2">
//               <p>
//                 <span className="bold">Phone: </span>
//                 {artist.phone}
//               </p>
//               <p>
//                 <span className="bold">Website:</span> {artist.website}
//               </p>
//             </div>
//             <h3
//               onClick={() => toggleAlbums(artist.id)}
//               className="albums-toggle"
//             >
//               View albums
//             </h3>
//             <h3
//               onClick={() => toggleTweets(artist.id)}
//               className="tweets-toggle"
//             >
//               View tweets
//             </h3>
//             {selectedArtistId === artist.id && (
//               <div className="albums-container">
//                 {getAlbumsForArtist(artist.id).map((album) => (
//                   <div key={album.id} className="album-card">
//                     <img src={Engageimg} className="album-image" />
//                     <p>{album.title}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//             {selectedTweetId === artist.id && (
//               <div className="tweets-container">
//                 {getTweetsForArtist(artist.id).map((tweet) => (
//                   <div key={tweet.id} className="tweet-card">
//                     <div className="tweet-header">
//                       <h4>{tweet.name}</h4>
//                       <p>{tweet.email}</p>
//                     </div>
//                     <div className="tweet-body">
//                       <p>{tweet.body}</p>
//                     </div>
//                     <button onClick={() => handleEdit(tweet)}>Edit</button>
//                   </div>
//                 ))}
//                 {editingTweetId === null && (
//                   <form
//                     className="tweet-form"
//                     onSubmit={(e) => handleSubmit(e, artist.id)}
//                   >
//                     <input
//                       type="text"
//                       name="name"
//                       placeholder="Name"
//                       value={newTweets[artist.id]?.name || ""}
//                       onChange={(e) => handleInputChange(e, artist.id)}
//                     />
//                     {validationErrors[artist.id]?.name && (
//                       <p className="error">
//                         {validationErrors[artist.id].name}
//                       </p>
//                     )}
//                     <input
//                       type="email"
//                       name="email"
//                       placeholder="Email"
//                       value={newTweets[artist.id]?.email || ""}
//                       onChange={(e) => handleInputChange(e, artist.id)}
//                     />
//                     {validationErrors[artist.id]?.email && (
//                       <p className="error">
//                         {validationErrors[artist.id].email}
//                       </p>
//                     )}
//                     <textarea
//                       name="body"
//                       placeholder="Body"
//                       value={newTweets[artist.id]?.body || ""}
//                       onChange={(e) => handleInputChange(e, artist.id)}
//                     />
//                     {validationErrors[artist.id]?.body && (
//                       <p className="error">
//                         {validationErrors[artist.id].body}
//                       </p>
//                     )}
//                     <button type="submit" disabled={!isFormValid(artist.id)}>
//                       Post Tweet
//                     </button>
//                   </form>
//                 )}
//                 {editingTweetId !== null && (
//                   <form
//                     className="tweet-form"
//                     onSubmit={(e) =>
//                       handleUpdate(e, selectedTweetId, editingTweetId)
//                     }
//                   >
//                     <input
//                       type="text"
//                       name="name"
//                       placeholder="Name"
//                       value={newTweets[selectedTweetId]?.name || ""}
//                       onChange={(e) => handleInputChange(e, selectedTweetId)}
//                     />
//                     {validationErrors[selectedTweetId]?.name && (
//                       <p className="error">
//                         {validationErrors[selectedTweetId].name}
//                       </p>
//                     )}
//                     <input
//                       type="email"
//                       name="email"
//                       placeholder="Email"
//                       value={newTweets[selectedTweetId]?.email || ""}
//                       onChange={(e) => handleInputChange(e, selectedTweetId)}
//                     />
//                     {validationErrors[selectedTweetId]?.email && (
//                       <p className="error">
//                         {validationErrors[selectedTweetId].email}
//                       </p>
//                     )}
//                     <textarea
//                       name="body"
//                       placeholder="Body"
//                       value={newTweets[selectedTweetId]?.body || ""}
//                       onChange={(e) => handleInputChange(e, selectedTweetId)}
//                     />
//                     {validationErrors[selectedTweetId]?.body && (
//                       <p className="error">
//                         {validationErrors[selectedTweetId].body}
//                       </p>
//                     )}
//                     <button type="submit" disabled={!isFormValid(artist.id)}>
//                       Update
//                     </button>
//                   </form>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Artist;
