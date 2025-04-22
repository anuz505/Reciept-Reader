import React from "react";
import { motion } from "framer-motion";
import { FaReceipt, FaUpload, FaChartBar, FaHistory } from "react-icons/fa";
import "./Home.css";
import Illustartion from "../assets/receipt_scanning.svg";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <FaUpload size={24} />,
      title: "Upload Receipts",
      description:
        "Quickly scan or upload your receipts with our easy-to-use interface.",
    },
    {
      icon: <FaReceipt size={24} />,
      title: "Automatic Recognition",
      description:
        "Our smart AI extracts key information from your receipts automatically.",
    },
    {
      icon: <FaChartBar size={24} />,
      title: "Expense Analytics",
      description:
        "Track spending patterns and budget more effectively with visual reports.",
    },
    {
      icon: <FaHistory size={24} />,
      title: "History Management",
      description:
        "Access your receipt history anytime, anywhere, on any device.",
    },
  ];

  return (
    <div className="home-container">
      <motion.div
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            Receipt Reader
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Simplify expense tracking with our intelligent receipt management
            system
          </motion.p>
          <motion.div
            className="cta-buttons"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              className="primary-button"
              onClick={() => navigate("/dashboard")}
            >
              Get Started
            </button>
            <button className="secondary-button">Learn More</button>
          </motion.div>
        </div>
        <div className="hero-image">
          <img src={Illustartion} alt="Receipt scanning illustration" />
        </div>
      </motion.div>

      <section className="features-section">
        <h2 className="section-title">Why Choose Receipt Reader?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Your Receipt</h3>
            <p>Take a photo or upload an existing image of your receipt</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Automatic Processing</h3>
            <p>Our system extracts and organizes the important information</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Review & Categorize</h3>
            <p>Review the details and categorize your expense</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to simplify your expense tracking?</h2>
        <p>Join thousands of users who are saving time with Receipt Reader</p>
        <button
          className="primary-button large"
          onClick={() => navigate("/dashboard")}
        >
          Let's get Started
        </button>
      </section>
    </div>
  );
};

export default Home;
