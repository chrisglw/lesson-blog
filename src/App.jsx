import './styles/App.css';
import Navbar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
// import Lessons from './pages/Lessons';
// import Dashboard from './pages/Dashboard';


function App() {

  return (
    <>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/lessons" element={<Lessons />} />
          <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </div>
    </>
  );
}

export default App
