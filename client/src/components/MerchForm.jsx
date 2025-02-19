import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const MerchForm = ({ setShowForm }) => {
  const { backendUrl, isLoggedin, userData } = useContext(AppContext);
  const [preview, setPreview] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    type: "physical",
    images: [] // Ensure this is an array
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isLoggedin) {
      toast.error("You must be logged in to list items.");
      return;
    }

    // Check if user has permission to sell
    if (!userData?.canSellMerch) {
      toast.error("You are not authorized to sell items.");
      return;
    }

    const formDataToSend = new FormData();

    // Append non-file fields
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("type", formData.type);

    // Append files (images)
    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        formDataToSend.append("images", formData.images[i]);
      }
    }

    try {
      const response = await fetch(`${backendUrl}/api/merch`, {
        method: "POST",
        credentials: 'include', // This ensures cookies are sent with the request
        body: formDataToSend,
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Item listed successfully!");
        setShowForm(false);
        window.location.reload(); // Refresh the page to show the new item
      } else {
        toast.error(data.message || "Failed to create merchandise");
        console.error("Failed to create merchandise:", data);
      }
    } catch (error) {
      toast.error("Error creating merchandise");
      console.error("Error creating merchandise:", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to array
    if (files.length === 0) return;
    
    handleImageFiles(files);
  };

  const handleImageFiles = (files) => {
    setFormData({ ...formData, images: files });

    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreview(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleImageFiles(files);
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newPreviews = [...preview];
    newPreviews.splice(index, 1);
    
    setFormData({ ...formData, images: newImages });
    setPreview(newPreviews);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name for your item");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description for your item");
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }
    if (!formData.images.length) {
      toast.error("Please upload at least one image");
      return false;
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="merch-form fade-in">
      <h2>List New Merchandise</h2>
      
      <label htmlFor="item-name">Item Name</label>
      <input
        id="item-name"
        type="text"
        placeholder="Enter item name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <label htmlFor="item-description">Description</label>
      <textarea
        id="item-description"
        placeholder="Describe your item in detail"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />
      
      <label htmlFor="item-price">Price (Rs)</label>
      <input
        id="item-price"
        type="number"
        placeholder="Enter price"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />
      
      <label htmlFor="item-type">Item Type</label>
      <select
        id="item-type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        required
      >
        <option value="physical">Physical Item</option>
        <option value="digital">Digital Item</option>
      </select>
      
      <label htmlFor="item-images">Upload Images</label>
      <div 
        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="item-images"
          type="file"
          multiple
          onChange={handleFileChange}
          accept="image/*"
          required={formData.images.length === 0}
        />
        <p>Drag & drop images here or click to browse</p>
      </div>
      
      {preview.length > 0 && (
        <div className="image-preview">
          {preview.map((src, index) => (
            <div key={index} className="preview-item">
              <img src={src} alt={`Preview ${index + 1}`} />
              <button 
                type="button" 
                className="remove-image-btn" 
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="form-actions">
        <button type="submit">List Item</button>
        <button 
          type="button" 
          onClick={() => setShowForm(false)} 
          className="cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MerchForm;