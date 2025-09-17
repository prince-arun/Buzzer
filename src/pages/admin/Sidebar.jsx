import React from 'react';
import { FiHome, FiBarChart2, FiUsers, FiSettings } from 'react-icons/fi';
import { FaTachometerAlt } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaTachometerAlt />
        <span>First Click</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="#" className="active">
              <FiHome className="nav-icon" />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#">
              <FiBarChart2 className="nav-icon" />
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#">
              <FiUsers className="nav-icon" />
              <span>Participants</span>
            </a>
          </li>
          <li>
            <a href="#">
              <FiSettings className="nav-icon" />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
