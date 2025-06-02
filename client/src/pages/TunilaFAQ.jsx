import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/TunilaFAQ.css";

const TunilaFAQ = () => {
  const faqData = [
    {
      category: "General",
      questions: [
        {
          question: "What is Tunila?",
          answer:
            "Tunila is a music streaming, publishing, and merchandise platform dedicated to empowering Nepali artists and connecting music lovers worldwide. Our mission is to enhance Nepal’s music industry by providing equal opportunities for artists to share their music and sell exclusive merchandise.",
        },
        {
          question: "How does Tunila support Nepali artists?",
          answer:
            "Tunila promotes emerging and established artists from Nepal by offering a platform to upload music, reach global audiences, and sell merchandise directly to fans. Our algorithm prioritizes new voices while celebrating Nepal’s rich musical heritage.",
        },
      ],
    },
    {
      category: "Music Streaming",
      questions: [
        {
          question: "Can I stream music for free on Tunila?",
          answer:
            "Yes, Tunila offers free music streaming with high-quality audio. Create a free account to access personalized playlists and discover new Nepali music.",
        },
        {
          question: "What kind of music can I find on Tunila?",
          answer:
            "Tunila features a diverse range of genres, with a special focus on Nepali music, including folk, pop, hip-hop, classical, and more. You’ll also find international artists and curated playlists tailored to your taste.",
        },
      ],
    },
    {
      category: "Uploading Music",
      questions: [
        {
          question: "How can I upload my music to Tunila?",
          answer:
            'Sign up for a Tunila artist account and navigate to the "Upload Music" section. Follow the steps to submit your tracks, album art, and metadata. Once approved, your music will be available for streaming worldwide.',
        },
        {
          question: "Are there any fees for uploading music?",
          answer:
            "Tunila offers free music uploads for artists. We believe in making music sharing accessible to everyone, especially aspiring artists in Nepal.",
        },
      ],
    },
    {
      category: "Merchandise",
      questions: [
        {
          question: "How can I buy merchandise on Tunila?",
          answer:
            'Visit the "Shop" section to browse exclusive merchandise from your favorite artists. Add items to your cart, proceed to checkout, and support artists directly with your purchase.',
        },
        {
          question: "Can artists sell their own merchandise on Tunila?",
          answer:
            "Yes, artists can create and sell their own merchandise through Tunila’s platform. From t-shirts to posters, artists can design and list items for fans to purchase, with Tunila handling the logistics.",
        },
      ],
    },
    {
      category: "Support",
      questions: [
        {
          question: "How can I contact Tunila support?",
          answer:
            'You can reach our support team via the "Contact Us" page or by emailing support@tunila.com. We’re here to help with any questions about streaming, uploading, or merchandise.',
        },
        {
          question: "What should I do if I encounter technical issues?",
          answer:
            "If you experience technical issues, try refreshing the page or clearing your browser cache. For persistent problems, contact our support team, and we’ll assist you promptly.",
        },
      ],
    },
  ];

  return (
    <div className="tunila-faq-page">
      <section className="tunila-faq-hero">
        <div className="tunila-faq-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Everything you need to know about Tunila and how we’re
            revolutionizing Nepal’s music industry.
          </motion.p>
        </div>
        <div className="tunila-faq-hero-wave">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="#f8f9fa"
            />
          </svg>
        </div>
      </section>

      <section className="tunila-faq-content">
        {faqData.map((category, index) => (
          <motion.div
            key={index}
            className="tunila-faq-category"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h2 className="tunila-faq-category-title">{category.category}</h2>
            <div className="tunila-faq-questions">
              {category.questions.map((faq, qIndex) => (
                <details key={qIndex} className="tunila-faq-item">
                  <summary className="tunila-faq-question">
                    {faq.question}
                  </summary>
                  <p className="tunila-faq-answer">{faq.answer}</p>
                </details>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      <section className="tunila-faq-cta">
        <motion.div
          className="tunila-faq-cta-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Still Have Questions?</h2>
          <p>
            Contact our support team or join the Tunila community to learn more.
          </p>
          <div className="tunila-faq-cta-buttons">
            <Link
              to="/contact"
              className="tunila-faq-cta-btn tunila-faq-cta-primary"
            >
              Contact Support
            </Link>
            <Link
              to="/login"
              className="tunila-faq-cta-btn tunila-faq-cta-secondary"
            >
              Join Tunila
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default TunilaFAQ;
