import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "../css/ContactForm.css";

const ContactForm = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${backendUrl}/api/contact/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData?.userId,
          ...formData,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to submit form");
    }
  };

  return (
    <div className="contact-form-container">
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="contact-form-group">
          <label className="contact-form-label">Name</label>
          <input
            type="text"
            className="contact-form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Your name"
          />
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label">Email</label>
          <input
            type="email"
            className="contact-form-input"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label">Subject</label>
          <input
            type="text"
            className="contact-form-input"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            required
            placeholder="What is this regarding?"
          />
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label">Message</label>
          <textarea
            className="contact-form-textarea"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows="5"
            required
            placeholder="Tell us more about your inquiry..."
          />
        </div>

        <button type="submit" className="contact-form-button">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
