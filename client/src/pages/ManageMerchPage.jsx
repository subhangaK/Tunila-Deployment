import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "../css/ManageMerchPage.css";
import MerchForm from "../components/MerchForm";

const ManageMerchPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, userData, isLoggedin } = useContext(AppContext);
  const [merch, setMerch] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!isLoggedin || userData?.userId !== userId) {
      toast.error("Unauthorized access");
      navigate(`/artist/${userId}/merch`);
      return;
    }

    const fetchMerch = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${backendUrl}/api/merch/artist/${userId}/all`,
          { withCredentials: true }
        );
        setMerch(response.data);
      } catch (err) {
        setError("Failed to load merchandise. Please try again.");
        toast.error("Error loading merchandise");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerch();
  }, [userId, backendUrl, isLoggedin, userData, navigate]);

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleUpdate = (updatedItem) => {
    setMerch(
      merch.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
    setEditingItem(null);
    toast.success("Merchandise updated successfully!");
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await axios.delete(
          `${backendUrl}/api/merch/${itemId}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setMerch(merch.filter((item) => item._id !== itemId));
          toast.success("Merchandise deleted successfully!");
        }
      } catch (err) {
        toast.error("Failed to delete merchandise");
      }
    }
  };

  if (isLoading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="ManageMerchPage">
      <div className="manage-merch-container">
        <h1>Manage Your Merchandise</h1>
        {editingItem && (
          <div className="merch-form-container">
            <MerchForm
              setShowForm={() => setEditingItem(null)}
              item={editingItem}
              onSuccess={handleUpdate}
              isEditMode={true}
            />
          </div>
        )}
        {merch.length === 0 ? (
          <div className="no-merch-message">
            <p>No merchandise items found. Add items from your artist page.</p>
          </div>
        ) : (
          <div className="merch-grid">
            {merch.map((item) => (
              <div key={item._id} className="manage-merch-item">
                <img
                  src={`${backendUrl}${item.images[0]}`}
                  alt={item.name}
                  className="merch-image"
                />
                <div className="merch-details">
                  <h3>{item.name}</h3>
                  <p>Price: Rs {item.price}</p>
                  <p>Stock: {item.stock}</p>
                  <p>Type: {item.type}</p>
                  <div className="merch-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMerchPage;
