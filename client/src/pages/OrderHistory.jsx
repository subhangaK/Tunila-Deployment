import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "../css/OrderHistory.css";

const OrderHistory = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/merch/orders/history`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderHistory();
  }, [backendUrl]);

  return (
    <div className="history-page">
      {/* Hero Section */}
      <section className="history-hero">
        <div className="history-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Purchase History
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Track all your merchandise purchases
          </motion.p>
        </div>
        <div className="history-hero-overlay"></div>
      </section>

      <div className="history-container">
        {isLoading ? (
          <div className="history-loading">
            <div className="history-loading-spinner"></div>
            <p>Loading your purchase history...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            className="history-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="history-empty-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h2>No purchases yet</h2>
            <p>You haven't made any purchases in our store yet.</p>
            <Link to="/merch" className="history-browse-button">
              Browse Merch Store
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="history-section-header">
              <h2>Your Orders</h2>
              <div className="history-section-line"></div>
            </div>

            <motion.div
              className="history-orders-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  className="history-order-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    transition: { duration: 0.2 },
                  }}
                >
                  <div className="history-order-status">
                    <span className="history-order-date">
                      {new Date(order.purchaseDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <span className="history-order-id">
                      Order #{order._id.slice(-6)}
                    </span>
                  </div>

                  <div className="history-order-content">
                    <div className="history-order-image-container">
                      <img
                        src={`${backendUrl}${order.merch.image}`}
                        alt={order.merch.name}
                        className="history-order-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-merch.png";
                        }}
                      />
                    </div>

                    <div className="history-order-details">
                      <h3 className="history-item-name">{order.merch.name}</h3>

                      <div className="history-artist-info">
                        <img
                          src={`${backendUrl}${order.merch.artistProfile}`}
                          alt={order.merch.artist}
                          className="history-artist-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-profile.png";
                          }}
                        />
                        <span className="history-artist-name">
                          {order.merch.artist}
                        </span>
                      </div>

                      <div className="history-price-info">
                        <div className="history-quantity">
                          <span className="history-label">Quantity:</span>
                          <span className="history-value">
                            {order.quantity}
                          </span>
                        </div>

                        <div className="history-price">
                          <span className="history-label">Price:</span>
                          <span className="history-value">
                            Rs {order.price}
                          </span>
                        </div>

                        <div className="history-total">
                          <span className="history-label">Total:</span>
                          <span className="history-value history-total-value">
                            Rs {order.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="history-order-actions">
                    <Link
                      to={`/merch/${order.merch._id}`}
                      className="history-view-button"
                    >
                      View Item Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="history-continue-shopping">
              <Link to="/merch" className="history-store-button">
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;
