/*
 * =======================================================================
 *                    GOPLANME EVENT MANAGEMENT SYSTEM
 * =======================================================================
 *
 *   Copyright (c) 2024-2025 Rahul Sahani
 *   All Rights Reserved.
 *
 *   This component contains proprietary code and trade secrets.
 *   Unauthorized copying, transfer, or use is strictly prohibited.
 *
 * =======================================================================
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Calendar,
  Users,
  MapPin,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import "./Home.css";
import toast from "react-hot-toast";

const Home = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    // Check if user is admin and redirect to admin dashboard
    if (user?.role === "admin") {
      toast.success("Welcome Admin!");
    } else if (user) {
      toast.success("Welcome to GoPlanMe!");
    }
  }, [user]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Event planning made easier for everyone
          </h1>
          <p className="hero-description">
            Plan and manage your events effortlessly. From birthday parties to
            corporate meetings, we've got you covered with comprehensive event
            management solutions.
          </p>

          <div className="flex flex-wrap gap-4 mt-4 mb-12">
            <Link to="/events">
              <motion.button
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Events <ArrowRight className="inline ml-2" size={20} />
              </motion.button>
            </Link>
          </div>

          <motion.div
            className="rating-badge"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="star-icon" size={20} fill="currentColor" />
            <span>Trusted by thousands of event planners</span>
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-image"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img width={"90%"} src="/assets/homepage.png" alt="Event Planning" />
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Our Premium Services
        </motion.h2>
        <div className="services-grid">
          <motion.div
            className="service-card"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="service-icon">
              <Calendar size={28} />
            </div>
            <h3 className="service-title">Event Planning</h3>
            <p>
              Comprehensive event planning and scheduling services for all types
              of events.
            </p>
          </motion.div>

          <motion.div
            className="service-card"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            <div className="service-icon">
              <Users size={28} />
            </div>
            <h3 className="service-title">Vendor Management</h3>
            <p>
              Connect with trusted vendors and service providers for your
              events.
            </p>
          </motion.div>

          <motion.div
            className="service-card"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          >
            <div className="service-icon">
              <MapPin size={28} />
            </div>
            <h3 className="service-title">Venue Selection</h3>
            <p>Find and book the perfect venue for your upcoming events.</p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="how-it-works-content">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <div className="checklist-container">
            {[
              "Create your event with all the details",
              "Browse and book vendors and venues",
              "Manage RSVPs and attendees",
              "Host successful events",
            ].map((item, index) => (
              <motion.div
                key={index}
                className="checklist-item"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="checklist-icon">
                  <PartyPopper size={24} />
                </div>
                <p>{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-container"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">
            Ready to Plan Your Next Event?
          </h2>
          <p>Join our platform and start planning memorable events today</p>
          <Link to={user ? "/events" : "/register"}>
            <motion.button
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user ? "Explore Events" : "Get Started Now"}
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
