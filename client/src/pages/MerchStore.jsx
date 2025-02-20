import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import MerchItem from "../components/MerchItem";
import MerchForm from "../components/MerchForm";
import { toast } from "react-toastify";
import Header from "../components/Header";
import "../css/MerchStore.css";

const MerchStore = () => {
  const { backendUrl, userData, isLoggedin } = useContext(AppContext);
  const [merch, setMerch] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMerch = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/merch`, {
          credentials: "include", // Ensure cookies are sent with GET requests too
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        setMerch(data);
      } catch (error) {
        console.error("Error fetching merchandise:", error);
        toast.error("Failed to load merchandise. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerch();
  }, [backendUrl]);

  const handleSellItemClick = () => {
    if (!isLoggedin) {
      toast.error("Please log in to sell items");
      return;
    }

    if (!userData?.canSellMerch) {
      toast.error(
        "You need to be a verified artist to sell items. Please upload music and verify your account first."
      );
      return;
    }

    setShowForm(true);
  };

  const refreshMerchandise = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/merch`);
      const data = await response.json();
      setMerch(data);
    } catch (error) {
      console.error("Error refreshing merchandise:", error);
    }
  };

  const handleWishlistUpdate = async () => {
    await Promise.all([getUserData(), refreshMerchandise()]);
  };

  return (
    <>
      <Header />
      <div className="merch-store">
        <div className="store-header">
          <h1>Tunila Merch Store</h1>
          <button
            onClick={handleSellItemClick}
            className={showForm ? "cancel-button" : ""}
          >
            {showForm ? "Cancel" : "Sell Item"}
          </button>
        </div>

        {showForm && <MerchForm setShowForm={setShowForm} />}

        {isLoading ? (
          <div>Loading </div>
        ) : merch.length === 0 ? (
          <div className="no-items-message">
            <p>No merchandise available at the moment.</p>
            {userData?.canSellMerch && (
              <p>Be the first to list an item in our store!</p>
            )}
          </div>
        ) : (
          <div className="merch-grid">
            {merch.map((item) => (
              <MerchItem
                key={item._id}
                item={item}
                onWishlistUpdate={handleWishlistUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MerchStore;
