// src/services/taskService.js
import { db } from './firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const taskCollection = collection(db, 'tasks');

// Listar todas as tarefas
export const getTasks = async () => {
  const q = query(taskCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Criar nova tarefa
export const createTask = async (data) => {
  return await addDoc(taskCollection, {
    ...data,
    status: data.status || 'Pendente',
    createdAt: serverTimestamp()
  });
};

// Atualizar status ou dados
export const updateTask = async (id, data) => {
  const docRef = doc(db, 'tasks', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

// Excluir tarefa
export const deleteTask = async (id) => {
  const docRef = doc(db, 'tasks', id);
  await deleteDoc(docRef);
};