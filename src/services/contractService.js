// src/services/contractService.js
import { db } from './firebase';
import { 
  collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

const collectionRef = collection(db, 'contracts');

export const getContracts = async () => {
  const q = query(collectionRef, orderBy('provider', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createContract = async (data) => {
  return await addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp()
  });
};

export const deleteContract = async (id) => {
  const docRef = doc(db, 'contracts', id);
  await deleteDoc(docRef);
};