import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentVerify = () => {
  const { backendUrl } = useContext(AppContext);
  const [verifying, setVerifying] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the pidx from the URL query parameters
        const params = new URLSearchParams(location.search);
        const pidx = params.get("pidx");

        if (!pidx) {
          toast.error("Invalid payment verification data");
          navigate("/payment-failed");
          return;
        }

        // Call your backend to verify the payment
        const response = await fetch(
          `${backendUrl}/api/merch/payment/verify?pidx=${pidx}`
        );

        // Your backend should handle the redirect, but as a fallback:
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          // If manual verification needed
          const result = await response.json();
          if (result.success) {
            navigate("/payment-success");
          } else {
            navigate("/payment-failed");
          }
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error("Failed to verify payment");
        navigate("/payment-failed");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [location, backendUrl, navigate]);

  return (
    <div className="payment-verify">
      <h2>Verifying Payment</h2>
      {verifying ? (
        <div className="loading">Processing your payment...</div>
      ) : (
        <div>Payment verification completed. Redirecting...</div>
      )}
    </div>
  );
};

export default PaymentVerify;
