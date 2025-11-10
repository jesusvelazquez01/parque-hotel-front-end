
import React, { createContext, useState } from "react";
import { toast } from "sonner";

export type UserRole = "customer" | "admin" | "employee" | "superadmin";

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  adminLogin: async () => {},
  register: async () => {},
  logout: async () => {},
  loading: false,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);



  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // TODO: Conectar con backend Java
      toast.success("Successfully logged in!");
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setLoading(false);
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string, forcedRole?: UserRole) => {
    setLoading(true);
    try {
      // TODO: Conectar con backend Java
      toast.success("Admin login successful");
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Admin login failed");
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role: UserRole = "customer") => {
    setLoading(true);
    try {
      // TODO: Conectar con backend Java
      toast.success("Registration successful!");
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // TODO: Conectar con backend Java
      setUser(null);
      toast.success("Logged out successfully");
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        adminLogin,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
