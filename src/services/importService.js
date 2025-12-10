// src/services/importService.js
import { db } from './firebase';
import { writeBatch, doc, collection } from 'firebase/firestore';

export const importAssetsBatch = async (dataArray) => {
  // Firestore permite max 500 operações por batch
  if (dataArray.length > 500) {
    throw new Error("O limite do Batch é 500 itens. Divida seu JSON.");
  }

  const batch = writeBatch(db);
  const collectionRef = collection(db, 'assets');

  let count = 0;

  dataArray.forEach((item) => {
    // Aqui está o segredo:
    // Estamos dizendo ao Firebase: "Use o internalId (ex: SHL-001) como o ID do documento"
    // Em vez de deixar o Firebase criar um ID aleatório (AxGh7...).
    // Isso torna o banco muito mais organizado.
    
    const docRef = doc(collectionRef, item.internalId); 
    
    // Preparando os dados (adicionando timestamps)
    const docData = {
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    batch.set(docRef, docData);
    count++;
  });

  // Só aqui os dados são realmente enviados (commit)
  await batch.commit();
  return count;
};