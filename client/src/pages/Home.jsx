import React, { useState } from "react";
import Header from "../components/Header";
import Body from "../components/Body";

function Home({ setCurrentTrack }) {
  return (
    <div className="home-container">
      <Body setCurrentTrack={setCurrentTrack} />
      {/* Pass filteredSongs to Body */}
    </div>
  );
}

export default Home;
