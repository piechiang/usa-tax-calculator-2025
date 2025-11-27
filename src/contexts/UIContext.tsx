import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  // Modal States
  showSpouseDialog: boolean;
  showClientManager: boolean;
  showInterviewFlow: boolean;
  showAdvancedFeatures: boolean;
  showProMode: boolean;
  showAssistant: boolean;
  showEnhancedWizard: boolean;
  showDataImportExport: boolean;
  showReviewAccuracy: boolean;

  // Tab States
  activeTab: string;
  advancedTab: string;
  useClassicMode: boolean;

  // State Setters
  setShowSpouseDialog: (show: boolean) => void;
  setShowClientManager: (show: boolean) => void;
  setShowInterviewFlow: (show: boolean) => void;
  setShowAdvancedFeatures: (show: boolean) => void;
  setShowProMode: (show: boolean) => void;
  setShowAssistant: (show: boolean) => void;
  setShowEnhancedWizard: (show: boolean) => void;
  setShowDataImportExport: (show: boolean) => void;
  setShowReviewAccuracy: (show: boolean) => void;
  closeAllModals: () => void;
  setActiveTab: (tab: string) => void;
  setAdvancedTab: (tab: string) => void;
  setUseClassicMode: (mode: boolean) => void;

  // Selected State
  selectedState: string;
  setSelectedState: (state: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUIContext = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

const defaultModalState = {
  showSpouseDialog: false,
  showClientManager: false,
  showInterviewFlow: false,
  showAdvancedFeatures: false,
  showProMode: false,
  showAssistant: false,
  showEnhancedWizard: false,
  showDataImportExport: false,
  showReviewAccuracy: false,
};

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  // Modal States
  const [modalState, setModalState] = useState(defaultModalState);

  const setShowSpouseDialog = (show: boolean) => setModalState(prev => ({ ...prev, showSpouseDialog: show }));
  const setShowClientManager = (show: boolean) => setModalState(prev => ({ ...prev, showClientManager: show }));
  const setShowInterviewFlow = (show: boolean) => setModalState(prev => ({ ...prev, showInterviewFlow: show }));
  const setShowAdvancedFeatures = (show: boolean) => setModalState(prev => ({ ...prev, showAdvancedFeatures: show }));
  const setShowProMode = (show: boolean) => setModalState(prev => ({ ...prev, showProMode: show }));
  const setShowAssistant = (show: boolean) => setModalState(prev => ({ ...prev, showAssistant: show }));
  const setShowEnhancedWizard = (show: boolean) => setModalState(prev => ({ ...prev, showEnhancedWizard: show }));
  const setShowDataImportExport = (show: boolean) => setModalState(prev => ({ ...prev, showDataImportExport: show }));
  const setShowReviewAccuracy = (show: boolean) => setModalState(prev => ({ ...prev, showReviewAccuracy: show }));
  const closeAllModals = () => setModalState(defaultModalState);

  // Tab States
  const [activeTab, setActiveTab] = useState('personal');
  const [advancedTab, setAdvancedTab] = useState('validator');
  const [useClassicMode, setUseClassicMode] = useState(false);

  // Selected State
  const [selectedState, setSelectedState] = useState('');

  const value: UIContextType = {
    showSpouseDialog: modalState.showSpouseDialog,
    showClientManager: modalState.showClientManager,
    showInterviewFlow: modalState.showInterviewFlow,
    showAdvancedFeatures: modalState.showAdvancedFeatures,
    showProMode: modalState.showProMode,
    showAssistant: modalState.showAssistant,
    showEnhancedWizard: modalState.showEnhancedWizard,
    showDataImportExport: modalState.showDataImportExport,
    showReviewAccuracy: modalState.showReviewAccuracy,
    activeTab,
    advancedTab,
    useClassicMode,
    selectedState,
    setShowSpouseDialog,
    setShowClientManager,
    setShowInterviewFlow,
    setShowAdvancedFeatures,
    setShowProMode,
    setShowAssistant,
    setShowEnhancedWizard,
    setShowDataImportExport,
    setShowReviewAccuracy,
    closeAllModals,
    setActiveTab,
    setAdvancedTab,
    setUseClassicMode,
    setSelectedState,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
