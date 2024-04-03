'use client';

import type { Agency } from '@/schema';
import {
  AuthUserWithAgencySidebarOptionsSubAccounts,
  TicketWithTags,
  UserWithPermissionsAndSubAccounts,
} from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';
type ModalProviderProps = {
  children: React.ReactNode;
};

export type ModalData = {
  user?: UserWithPermissionsAndSubAccounts;
  authUser?: AuthUserWithAgencySidebarOptionsSubAccounts;
  agency?: Agency;
  ticket?: TicketWithTags[number];
};

type ModalContextProps = {
  data?: ModalData;
  opened?: boolean;
  setOpen: (
    modal: React.ReactNode,
    fetchData?: () => Promise<Record<string, unknown>>
  ) => void;
  setClose: () => void;
};

export const ModalContext = createContext<ModalContextProps>({
  setClose: () => {},
  setOpen: () => {},
});

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [opened, setOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [modalView, setModalView] = useState<React.ReactNode | null>(null);
  const [mounted, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);

  const setModalOpen = async (
    modal: React.ReactNode,
    fetchData?: () => Promise<Record<string, unknown>>
  ) => {
    if (modal) {
      if (fetchData) {
        setData({ ...data, ...(await fetchData()) });
      }

      setModalView(modal);
      setOpen(true);
    }
  };

  const setClose = () => {
    setOpen(false);
    setData({});
    setModalView(null);
  };

  return (
    <ModalContext.Provider
      value={{ data, opened, setOpen: setModalOpen, setClose }}
    >
      {children}
      {mounted && modalView}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within the modal provider');
  }

  return context;
};
