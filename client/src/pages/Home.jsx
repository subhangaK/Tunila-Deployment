import React, { useState } from "react";
import Header from "../components/Header";
import Body from "../components/Body";

function Home({setCurrentTrack}) {
  const [filteredSongs, setFilteredSongs] = useState([]);

  return (
    <div className="home-container">
      <Header setFilteredSongs={setFilteredSongs} /> {/* Pass setFilteredSongs to Header */}
      <Body setCurrentTrack={setCurrentTrack} filteredSongs={filteredSongs} /> {/* Pass filteredSongs to Body */}
    </div>
  );
}

export default Home;
