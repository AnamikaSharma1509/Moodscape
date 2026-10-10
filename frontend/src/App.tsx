import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { WhyThisMovieModal } from './components/WhyThisMovieModal';

// Pages
import { Home } from './pages/Home';
import { Quiz } from './pages/Quiz';
import { Recommendations } from './pages/Recommendations';
import { RoomsHub } from './pages/RoomsHub';
import { CreateRoom } from './pages/CreateRoom';
import { JoinRoom } from './pages/JoinRoom';
import { RoomLobby } from './pages/RoomLobby';
import { SwipeSession } from './pages/SwipeSession';
import { GroupResults } from './pages/GroupResults';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-pastel-cream dark:bg-[#0B0D13] text-slate-800 dark:text-slate-100 transition-colors selection:bg-purple-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/discover" element={<Navigate to="/quiz" replace />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/rooms" element={<RoomsHub />} />
              <Route path="/rooms/create" element={<CreateRoom />} />
              <Route path="/rooms/join" element={<JoinRoom />} />
              <Route path="/rooms/demo" element={<Navigate to="/rooms/MOOD-DEMO/results" replace />} />
              <Route path="/rooms/:roomId" element={<RoomLobby />} />
              <Route path="/rooms/:roomId/lobby" element={<RoomLobby />} />
              <Route path="/rooms/:roomId/swipe" element={<SwipeSession />} />
              <Route path="/rooms/:roomId/results" element={<GroupResults />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/watchlist" element={<FavoritesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />

          {/* Global Interactive Modals */}
          <MovieDetailsModal />
          <WhyThisMovieModal />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
