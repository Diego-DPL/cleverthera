import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Transcripcion from './pages/Transcripcion'; 
import Home from './pages/Home'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; // Importamos el componente

const App: React.FC = () => {
  return (
    <> 
      <div>
        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/transcripcion" 
              element={<ProtectedRoute element={<Transcripcion />} />} 
            />
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </div>
    </>
  );
};

export default App;
