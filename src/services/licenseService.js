// src/services/licenseService.js
import { db } from './firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove 
} from 'firebase/firestore';

const licenseCollection = collection(db, 'licenses');

// Listar todas as licenças (ordem alfabética)
export const getLicenses = async () => {
  const q = query(licenseCollection, orderBy('softwareName', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Criar nova licença
export const createLicense = async (data) => {
  return await addDoc(licenseCollection, {
    ...data,
    usedCount: 0, // Começa com 0 ativações
    assignedAssets: [], // Lista de quem está usando
    createdAt: serverTimestamp()
  });
};

// Atualizar dados da licença
export const updateLicense = async (id, data) => {
  const docRef = doc(db, 'licenses', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

// Excluir licença
export const deleteLicense = async (id) => {
  const docRef = doc(db, 'licenses', id);
  await deleteDoc(docRef);
};

// VINCULAR: Adiciona o ativo na lista da licença
export const assignLicense = async (licenseId, assetId, assetName) => {
  const licenseRef = doc(db, 'licenses', licenseId);
  
  await updateDoc(licenseRef, {
    assignedAssets: arrayUnion({ id: assetId, name: assetName }),
    updatedAt: serverTimestamp()
  });
};

// DESVINCULAR: Libera a vaga da licença
export const unassignLicense = async (licenseId, assetObjectToRemove) => {
  const licenseRef = doc(db, 'licenses', licenseId);
  
  await updateDoc(licenseRef, {
    assignedAssets: arrayRemove(assetObjectToRemove),
    updatedAt: serverTimestamp()
  });
};