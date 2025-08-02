import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Home from './Home';
import Signup from './Signup';
import Ask from './Ask';
import Logout from './Logout';
import AgentDashboard from './AgentDashboard';
import TicketDetail from './TicketDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* End User Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/ask" element={<Ask />} />

          {/* Agent/Admin Routes */}
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/ticket/:id" element={<TicketDetail />} />

          {/* Logout Route */}
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
