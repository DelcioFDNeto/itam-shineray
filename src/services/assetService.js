// src/services/assetService.js
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, // <--- Importante para a exclusão
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const assetsCollection = collection(db, 'assets');

// --- LEITURA (READ) ---

// Busca todos os ativos ordenados por criação
export const getAllAssets = async () => {
  const q = query(assetsCollection, orderBy('createdAt', 'desc')); 
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Busca um ativo específico pelo ID do documento
export const getAssetById = async (id) => {
  const docRef = doc(db, 'assets', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  throw new Error("Ativo não encontrado");
};

// Busca o histórico de um ativo
export const getAssetHistory = async (assetId) => {
  const historyRef = collection(db, 'assets', assetId, 'history');
  const q = query(historyRef, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- ESCRITA (CREATE / UPDATE / DELETE) ---

// Cria um novo ativo
export const createAsset = async (assetData) => {
  return await addDoc(assetsCollection, {
    ...assetData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Atualiza dados gerais de um ativo (usado para editar, salvar notas, etc.)
export const updateAsset = async (id, assetData) => {
  const docRef = doc(db, 'assets', id);
  await updateDoc(docRef, {
    ...assetData,
    updatedAt: serverTimestamp()
  });
};

// Exclui um ativo permanentemente
export const deleteAsset = async (id) => {
  const assetRef = doc(db, 'assets', id);
  await deleteDoc(assetRef);
  return true;
};

// --- AÇÕES ESPECÍFICAS (LÓGICA DE NEGÓCIO) ---

// Realiza a movimentação (atualiza ativo + cria log de histórico)
export const moveAsset = async (assetId, currentData, moveData) => {
  const assetRef = doc(db, 'assets', assetId);
  const historyRef = collection(db, 'assets', assetId, 'history');

  const updateData = {
    assignedTo: moveData.newHolderName,
    clientCpf: moveData.newHolderCpf || '',
    sector: moveData.newSector || '',
    location: moveData.newLocation,
    status: moveData.newStatus,
    updatedAt: serverTimestamp()
  };

  const historyLog = {
    type: 'movimentacao',
    date: new Date(),
    timestamp: serverTimestamp(),
    previousHolder: currentData.assignedTo || 'Estoque/Indefinido',
    previousLocation: currentData.location || 'Indefinido',
    newHolder: moveData.newHolderName,
    newLocation: moveData.newLocation,
    reason: moveData.reason || 'Movimentação via Sistema',
    user: 'Admin TI' 
  };

  await updateDoc(assetRef, updateData);
  await addDoc(historyRef, historyLog);
  return true;
};

// Registra manutenção (atualiza status + cria log financeiro)
export const registerMaintenance = async (assetId, maintenanceData) => {
  const assetRef = doc(db, 'assets', assetId);
  const historyRef = collection(db, 'assets', assetId, 'history');

  const updateData = {
    status: 'Manutenção',
    updatedAt: serverTimestamp()
  };

  const historyLog = {
    type: 'manutencao',
    date: new Date(),
    timestamp: serverTimestamp(),
    cost: maintenanceData.cost || '0,00',
    provider: maintenanceData.provider || 'Interno',
    defect: maintenanceData.defect,
    description: maintenanceData.description,
    user: 'Admin TI'
  };

  await updateDoc(assetRef, updateData);
  await addDoc(historyRef, historyLog);
  return true;
};