import React, { useState } from "react";
import Header from "../components/Header";
import Body from "../components/Body";
import Footer from "../components/Footer";

function Home({ setCurrentTrack }) {
  return (
    <div className="home-page">
      <div className="home-container">
        <Body setCurrentTrack={setCurrentTrack} />
        {/* Pass filteredSongs to Body */}
      </div>
      <Footer />
    </div>
  );
}

export default Home;
