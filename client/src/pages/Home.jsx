import React, { useState } from "react";
import Header from "../components/Header";
import MusicPlayer from "../components/MusicPlayer";
import Body from "../components/Body";

function Home() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [filteredSongs, setFilteredSongs] = useState([]); // To hold filtered songs based on search

  return (
    <div className="home-container">
      <Header setFilteredSongs={setFilteredSongs} /> {/* Pass setFilteredSongs to Header */}
      <Body setCurrentTrack={setCurrentTrack} filteredSongs={filteredSongs} /> {/* Pass filteredSongs to Body */}
      <MusicPlayer currentTrack={currentTrack} setCurrentTrack={setCurrentTrack} />
    </div>
  );
}

export default Home;
