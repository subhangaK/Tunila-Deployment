import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";
import Logo from "../assets/Tunila.png";
import "../css/Footer.css";

function Footer() {
  const navigate = useNavigate();

  const footer_goToHome = () => {
    navigate("/");
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-container">
      <div className="footer-top">
        <div className="footer-logo-section">
          <div className="footer-logo-container" onClick={footer_goToHome}>
            <img className="footer-logo" src={Logo} alt="Tunila Logo" />
            <span className="footer-logo-text">Tunila</span>
          </div>
          <p className="footer-slogan">Music that moves with you</p>
        </div>

        <div className="footer-links-section">
          <div className="footer-links-column">
            <h3 className="footer-column-title">Company</h3>
            <ul className="footer-link-list">
              <li onClick={() => navigate("/contact")}>Contact Us</li>
              <li onClick={() => navigate("/press")}>Press</li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h3 className="footer-column-title">Community</h3>
            <ul className="footer-link-list">
              <li onClick={() => navigate("/artists")}>For Artists</li>
              <li onClick={() => navigate("/developers")}>Developers</li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h3 className="footer-column-title">Support</h3>
            <ul className="footer-link-list">
              <li onClick={() => navigate("/help")}>Help Center</li>
              <li onClick={() => navigate("/account")}>Account</li>
              <li onClick={() => navigate("/contact")}>Contact Us</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-social-links">
          <a
            href="https://github.com/tunila"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            <FaGithub />
          </a>
          <a
            href="https://twitter.com/tunila"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com/subhangakhanal"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            <FaInstagram />
          </a>
          <a
            href="https://facebook.com/tunila"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            <FaFacebook />
          </a>
        </div>

        <div className="footer-copyright">
          <p>© {currentYear} Tunila. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
