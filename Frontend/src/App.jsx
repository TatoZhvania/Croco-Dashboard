import React, { useState, useCallback } from 'react';
import { useDarkMode } from './hooks/useDarkMode.jsx';
import { useApiDashboardItems } from './hooks/useApiDashboardItems.jsx';
import { useAuth } from './hooks/useAuth.jsx';
import { useDragAndDrop } from './hooks/useDragAndDrop.jsx';
import { useCategoryManagement } from './hooks/useCategoryManagement.jsx';
import { useModals } from './hooks/useModals.jsx';
import { useDataProcessing } from './hooks/useDataProcessing.jsx';

// Components-test
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';
import { ErrorDisplay } from './components/common/ErrorDisplay.jsx';
import { Header } from './components/layout/Header.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { CategorySection } from './components/dashboard/CategorySection.jsx';
import { EmptyState } from './components/dashboard/EmptyState.jsx';
import { ItemFormModal } from './components/modals/ItemFormModal.jsx';
import { ConfirmationModal } from './components/modals/ConfirmationModal.jsx';
import { CategoryEditModal } from './components/modals/CategoryEditModal.jsx';
import { AuthModal } from './components/modals/AuthModal.jsx';
import { LogoutConfirmationModal } from './components/modals/LogoutConfirmationModal.jsx';
import { MoveConfirmationModal } from './components/modals/MoveConfirmationModal.jsx';
import { ImportModal } from './components/modals/ImportModal.jsx';
import { downloadJson } from './utils/exporter.js';

export default function App() {
  const [theme, toggleTheme] = useDarkMode();
  const { token, isAdmin, authError, isChecking, login, logout, resetAuthError } = useAuth();
  const {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    deleteAllItemsInCategory,
    fetchData,
    importItems,
    exportItems
  } = useApiDashboardItems(token);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const canManage = isAdmin;
  const activeEditMode = canManage && isEditMode;

  // Custom Hooks for Feature Management
  const modals = useModals(canManage, isAdmin);
  const categoryMgmt = useCategoryManagement(items, updateItem, canManage);
  const { filteredItems, groupedData, sortedCategories } = useDataProcessing(
    items,
    searchTerm,
    categoryMgmt.categoryOrder
  );
  const dragHandlers = useDragAndDrop(items, updateItem, activeEditMode, modals.setPendingMove);

  // Auth Modal Handlers
  const openLoginModal = useCallback(() => {
    modals.openLoginModal(resetAuthError);
  }, [modals, resetAuthError]);

  const closeLoginModal = useCallback(() => {
    modals.closeLoginModal(resetAuthError);
  }, [modals, resetAuthError]);

  // Edit Mode Toggle
  const handleToggleEditMode = useCallback(() => {
    if (!canManage) {
      openLoginModal();
      return;
    }
    setIsEditMode(prev => !prev);
  }, [canManage, openLoginModal]);

  // Auth Handlers
  const handleSubmitLogin = useCallback(async ({ username, password }) => {
    const success = await login(username, password);
    if (success) {
      closeLoginModal();
    }
  }, [closeLoginModal, login]);

  const handleLogout = useCallback(() => {
    logout();
    closeLoginModal();
  }, [closeLoginModal, logout]);

  const handleRequestLogout = useCallback(() => {
    modals.setShowLogoutConfirm(true);
  }, [modals]);

  const handleConfirmLogout = useCallback(() => {
    handleLogout();
    modals.setShowLogoutConfirm(false);
  }, [handleLogout, modals]);

  // Import/Export Handlers
  const handleExport = useCallback(async () => {
    if (!canManage) {
      openLoginModal();
      return;
    }
    const serverData = await exportItems();
    const exportPayload = serverData?.items ? serverData : { items };
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadJson(exportPayload, `dashboard-export-${timestamp}.json`);
  }, [canManage, exportItems, items, openLoginModal]);

  // Render Logic
  const showFatalError = error && items.length === 0;

  if (isLoading && items.length === 0) return <LoadingSpinner />;
  if (showFatalError) return <ErrorDisplay error={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-8 pb-6 sm:pb-8 font-sans transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        items={items}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isEditMode={activeEditMode}
        isAdmin={isAdmin}
        isAuthenticating={isChecking}
        onLoginRequest={openLoginModal}
        onLogoutRequest={handleRequestLogout}
        canManage={canManage}
        onToggleEditMode={handleToggleEditMode}
        onAddNew={() => modals.handleAddNew(openLoginModal)}
        onExport={handleExport}
        onImport={() => modals.handleOpenImportModal(openLoginModal)}
      />

      {/* Spacer for fixed header */}
      <div className="h-[140px]"></div>

      {error && items.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <main>
        {filteredItems.length === 0 && items.length > 0 ? (
          <EmptyState type="search" searchTerm={searchTerm} />
        ) : filteredItems.length === 0 ? (
          <EmptyState type="empty" />
        ) : (
          <div className="space-y-6 md:space-y-8">
            {sortedCategories.map(category => (
              <CategorySection
                key={category}
                category={category}
                categoryData={groupedData[category]}
                isCollapsed={categoryMgmt.collapsedCategories[category] === true}
                isEditMode={activeEditMode}
                canManage={canManage}
                onToggleCollapse={categoryMgmt.toggleCollapse}
                onDeleteCategory={(cat, itms) => modals.handleTriggerDeleteCategory(cat, itms, openLoginModal)}
                onDeleteItem={(item) => modals.handleTriggerDeleteItem(item, openLoginModal)}
                onEditItem={(item) => modals.handleEditItem(item, openLoginModal)}
                onUpdateItemSize={(itemId, newSize) => updateItem(itemId, { size: newSize })}
                onDropItem={dragHandlers.handleDropItem}
                onCategoryDrop={(e) => dragHandlers.handleCategoryDrop(e, category, groupedData[category])}
                onCategoryDragOver={dragHandlers.handleCategoryDragOver}
                onCategoryDragLeave={dragHandlers.handleCategoryDragLeave}
                onOpenEditCategory={(name, icon) => categoryMgmt.handleOpenEditCategory(name, icon, openLoginModal)}
                onCategorySectionDragStart={dragHandlers.handleCategorySectionDragStart}
                onCategorySectionDragEnd={dragHandlers.handleCategorySectionDragEnd}
                onCategorySectionDragOver={dragHandlers.handleCategorySectionDragOver}
                onCategorySectionDragLeave={dragHandlers.handleCategorySectionDragLeave}
                onCategorySectionDrop={(e, cat) => dragHandlers.handleCategorySectionDrop(e, cat, items, categoryMgmt.setCategoryOrder)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer theme={theme} toggleTheme={toggleTheme} fixed />

      {/* Modals */}
      {(modals.showAddModal || modals.editingItem) && (
        <ItemFormModal
          onSave={addItem}
          onUpdate={updateItem}
          itemToEdit={modals.editingItem}
          existingCategories={categoryMgmt.existingCategories}
          isAdmin={isAdmin}
          onClose={() => {
            modals.setShowAddModal(false);
            modals.setEditingItem(null);
          }}
        />
      )}

      {modals.itemToDelete && (
        <ConfirmationModal
          item={modals.itemToDelete}
          onConfirm={(id) => modals.handleDeleteItemConfirmed(id, deleteItem)}
          onCancel={() => modals.setItemToDelete(null)}
        />
      )}

      {modals.categoryToDelete && (
        <ConfirmationModal
          type="category"
          categoryName={modals.categoryToDelete.name}
          item={modals.categoryToDelete.items}
          onConfirm={(name) => modals.handleDeleteCategoryConfirmed(name, deleteAllItemsInCategory)}
          onCancel={() => modals.setCategoryToDelete(null)}
        />
      )}

      {categoryMgmt.editingCategory && (
        <CategoryEditModal
          isOpen={!!categoryMgmt.editingCategory}
          initialName={categoryMgmt.editingCategory.name}
          initialIcon={categoryMgmt.editingCategory.icon}
          onClose={() => categoryMgmt.setEditingCategory(null)}
          onSave={categoryMgmt.handleSaveCategoryEdits}
        />
      )}

      <AuthModal
        isOpen={modals.showLoginModal}
        onClose={closeLoginModal}
        onSubmit={handleSubmitLogin}
        isLoading={isChecking}
        error={authError}
      />

      <LogoutConfirmationModal
        isOpen={modals.showLogoutConfirm}
        onCancel={() => modals.setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />

      <MoveConfirmationModal
        isOpen={!!modals.pendingMove}
        fromCategory={modals.pendingMove?.fromCategory}
        toCategory={modals.pendingMove?.toCategory}
        onConfirm={() => modals.handleConfirmMove(updateItem)}
        onCancel={() => modals.setPendingMove(null)}
      />

      <ImportModal
        isOpen={modals.showImportModal}
        onClose={() => modals.setShowImportModal(false)}
        onImport={(items, replace) => modals.handleImport(items, replace, importItems)}
        isLoading={modals.isImporting}
        error={error}
      />
    </div>
  );
}
