import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '../features/objects/HomePage.js';
import { ObjectPage } from '../features/objects/ObjectPage.js';
import { StatesPage } from './StatesPage.js';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/objects/:id" element={<ObjectPage />} />
      <Route path="/states" element={<StatesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
