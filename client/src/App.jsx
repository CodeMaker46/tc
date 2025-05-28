import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={<Auth />}
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/calculator" element={<Calculator />} />
                </Routes>
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
