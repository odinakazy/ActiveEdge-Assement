import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Artist.css";
import Engageimg from "../assets/Engage.png";

function Artist() {
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtistId, setSelectedArtistId] = useState(null);

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

    fetchArtists();
    fetchAlbums();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Function to get albums for a specific artist
  const getAlbumsForArtist = (artistId) => {
    return albums.filter((album) => album.userId === artistId);
  };

  // Function to toggle the display of albums
  const toggleAlbums = (artistId) => {
    setSelectedArtistId(selectedArtistId === artistId ? null : artistId);
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Artist;
