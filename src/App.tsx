import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Transcripcion from './pages/Transcripcion'; // Tu componente principal con la funcionalidad de transcripción
import Login from './pages/Login';
import Register from './pages/Register';
import Header from './components/Header';



const App: React.FC = () => {


  return (
  <>
    <div>
      <Router>
      <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Transcripcion />} />
        </Routes>
      </Router>
    </div>

  </>
  );
};

export default App;
