import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  username: string;
  setUsername: (username: string) => void;
  requiresPassword: boolean;
  setRequiresPassword: (value: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
} 
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string>('');
  const [requiresPassword, setRequiresPassword] = useState<boolean>(false); 
  const [password, setPassword] = useState<string>('');

  return (
    <UserContext.Provider value={{ username, setUsername, requiresPassword, setRequiresPassword, password, setPassword }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
