import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { LoginPage } from './infrastructure/ui/pages/login_page'
import { RegisterPage } from './infrastructure/ui/pages/register_page'
import { ChangePasswordPage } from './infrastructure/ui/pages/change_password_page'
import { RoomsListPage } from './infrastructure/ui/pages/rooms_list_page'
import { RoomContainer } from './infrastructure/ui/pages/room_container_page'

const RootApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Declaramos las rutas absolutas. Fíjate que ya no pasamos 'onNavigate' */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change_password" element={<ChangePasswordPage />} />
        <Route path="/rooms_list" element={<RoomsListPage />} />
        <Route path="/room/:roomCode" element={<RoomContainer />} />

        {/* Ruta de redirección por defecto. Si entran a la raíz '/' o escriben algo mal, van al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(
  <RootApp />
);