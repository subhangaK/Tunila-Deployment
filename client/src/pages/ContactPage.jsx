import React from "react";
import ContactForm from "../components/ContactForm";
import { assets } from "../assets/assets";
import "../css/ContactPage.css";
import {
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
  FaQuestion,
} from "react-icons/fa";

import Footer from "../components/Footer";

const ContactPage = () => {
  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">We'd Love to Hear From You</h1>
          <p className="contact-hero-text">
            Whether you have questions about Tunila, need technical support, or
            want to provide feedback, our team is here to help.
          </p>
        </div>
        <div className="contact-hero-image">
          <img src={assets.logo} alt="Contact Tunila" />
        </div>
      </section>

      {/* Main Content */}
      <div className="contact-container">
        {/* Contact Info */}
        <section className="contact-info">
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FaEnvelope />
            </div>
            <h3 className="contact-info-title">Email Us</h3>
            <p className="contact-info-text">tunilamusicnepal@gmail.com</p>
            <p className="contact-info-text">subhangakhanal@gmail.com</p>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <img src={assets.logo} alt="Social Media" />
            </div>
            <h3 className="contact-info-title">Connect With Us</h3>
            <div className="contact-social-links">
              <a href="#" className="contact-social-link">
                <FaTwitter />
              </a>
              <a href="#" className="contact-social-link">
                <FaInstagram />
              </a>
              <a href="#" className="contact-social-link">
                <FaFacebook />
              </a>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-info-icon">
              <FaQuestion />
            </div>
            <h3 className="contact-info-title">FAQs</h3>
            <p className="contact-info-text">
              Check our{" "}
              <a href="/faq" className="contact-link">
                FAQ page
              </a>{" "}
              for quick answers to common questions.
            </p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="contact-form-section">
          <div className="contact-form-intro">
            <h2 className="contact-form-heading">Send Us a Message</h2>
            <p className="contact-form-subtext">
              Fill out the form below and we'll get back to you as soon as
              possible. Our average response time is 24-48 hours.
            </p>
            <div className="contact-support-hours">
              <img
                src={assets.clock_icon}
                alt="Support Hours"
                className="contact-hours-icon"
              />
              <p className="contact-hours-text">
                <strong>Support Hours:</strong> Monday-Friday, 9AM-5PM EST
              </p>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <ContactForm />
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="contact-cta-section">
        <div className="contact-cta-content">
          <h2 className="contact-cta-title">Still Have Questions?</h2>
          <p className="contact-cta-text">
            Visit our{" "}
            <a href="/faq" className="contact-link">
              FAQ
            </a>{" "}
            for detailed guides and tutorials.
          </p>
          <button className="contact-cta-button">Visit FAQ Page</button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactPage;
