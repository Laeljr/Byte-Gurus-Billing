// src/services/storageService.js

const STORAGE_KEYS = {
  invoices: 'invoices',
  quotations: 'quotations',
  receipts: 'receipts',
};

export const saveItem = (type, item) => {
  const key = STORAGE_KEYS[type];
  let existing = JSON.parse(localStorage.getItem(key)) || [];
  existing.push(item);
  localStorage.setItem(key, JSON.stringify(existing));
};

export const getItems = (type) => {
  const key = STORAGE_KEYS[type];
  return JSON.parse(localStorage.getItem(key)) || [];
};
