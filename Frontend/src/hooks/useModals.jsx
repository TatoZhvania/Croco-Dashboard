import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage all modal states and operations
 */
export const useModals = (canManage, isAdmin) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingMove, setPendingMove] = useState(null); // { itemId, fromCategory, toCategory, updates }
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Keep edit-only UI closed for guest users
  useEffect(() => {
    if (!isAdmin) {
      setShowAddModal(false);
      setEditingItem(null);
    }
  }, [isAdmin]);

  const openLoginModal = useCallback((resetAuthError) => {
    resetAuthError();
    setShowLoginModal(true);
  }, []);

  const closeLoginModal = useCallback((resetAuthError) => {
    resetAuthError();
    setShowLoginModal(false);
  }, []);

  const handleAddNew = useCallback((openLoginModalFn) => {
    if (!canManage) {
      openLoginModalFn();
      return;
    }
    setShowAddModal(true);
  }, [canManage]);

  const handleEditItem = useCallback((item, openLoginModalFn) => {
    if (!canManage) {
      openLoginModalFn();
      return;
    }
    setEditingItem(item);
  }, [canManage]);

  const handleTriggerDeleteItem = useCallback((item, openLoginModalFn) => {
    if (!canManage) {
      openLoginModalFn();
      return;
    }
    setItemToDelete(item);
  }, [canManage]);

  const handleTriggerDeleteCategory = useCallback((categoryName, items, openLoginModalFn) => {
    if (!canManage) {
      openLoginModalFn();
      return;
    }
    setCategoryToDelete({ name: categoryName, items: items });
  }, [canManage]);

  const handleDeleteItemConfirmed = useCallback(async (itemId, deleteItem) => {
    if (!canManage) return;
    await deleteItem(itemId);
    setItemToDelete(null);
  }, [canManage]);

  const handleDeleteCategoryConfirmed = useCallback(async (categoryName, deleteAllItemsInCategory) => {
    if (!canManage) return;
    await deleteAllItemsInCategory(categoryName);
    setCategoryToDelete(null);
  }, [canManage]);

  const handleOpenImportModal = useCallback((openLoginModalFn) => {
    if (!canManage) {
      openLoginModalFn();
      return;
    }
    setShowImportModal(true);
  }, [canManage]);

  const handleImport = useCallback(async (itemsToImport, replaceExisting, importItems) => {
    if (!canManage) return;
    setIsImporting(true);
    const success = await importItems(itemsToImport, replaceExisting);
    setIsImporting(false);
    if (success) {
      setShowImportModal(false);
    }
  }, [canManage]);

  const handleConfirmMove = useCallback(async (updateItem) => {
    if (!pendingMove) return;
    await updateItem(pendingMove.itemId, pendingMove.updates);
    setPendingMove(null);
  }, [pendingMove]);

  return {
    // State
    showAddModal,
    editingItem,
    itemToDelete,
    categoryToDelete,
    showLoginModal,
    showLogoutConfirm,
    pendingMove,
    showImportModal,
    isImporting,
    // Setters
    setShowAddModal,
    setEditingItem,
    setItemToDelete,
    setCategoryToDelete,
    setShowLoginModal,
    setShowLogoutConfirm,
    setPendingMove,
    setShowImportModal,
    // Handlers
    openLoginModal,
    closeLoginModal,
    handleAddNew,
    handleEditItem,
    handleTriggerDeleteItem,
    handleTriggerDeleteCategory,
    handleDeleteItemConfirmed,
    handleDeleteCategoryConfirmed,
    handleOpenImportModal,
    handleImport,
    handleConfirmMove,
  };
};
