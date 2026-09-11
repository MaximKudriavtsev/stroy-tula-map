import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ObjectFormPage } from '../features/objects/ObjectFormPage.js';
import { ObjectsPage } from '../features/objects/ObjectsPage.js';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ObjectsPage />} />
      <Route path="/form" element={<ObjectFormPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
