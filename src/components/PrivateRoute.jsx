// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Se não tem usuário, redireciona para a Raiz (que é o Login)
  if (!currentUser) {
    // ERRO ERA AQUI: estava "/login", deve ser "/"
    return <Navigate to="/" />; 
  }

  // Se tem usuário, mostra o conteúdo (children)
  return children;
};

export default PrivateRoute;