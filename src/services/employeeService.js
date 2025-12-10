// src/services/employeeService.js
import { db } from './firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy 
} from 'firebase/firestore';

const employeeCollection = collection(db, 'employees');

export const getEmployees = async () => {
  const q = query(employeeCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEmployeeById = async (id) => {
  const docRef = doc(db, 'employees', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  throw new Error("Funcionário não encontrado");
};

export const createEmployee = async (data) => {
  // Salva nome sempre em maiúsculo para facilitar busca
  const cleanData = {
    ...data,
    name: data.name.toUpperCase(),
    sector: data.sector.toUpperCase(),
    createdAt: new Date()
  };
  return await addDoc(employeeCollection, cleanData);
};

export const updateEmployee = async (id, data) => {
  const docRef = doc(db, 'employees', id);
  await updateDoc(docRef, {
    ...data,
    name: data.name.toUpperCase(),
    sector: data.sector.toUpperCase(),
    updatedAt: new Date()
  });
};

export const deleteEmployee = async (id) => {
  const docRef = doc(db, 'employees', id);
  await deleteDoc(docRef);
};