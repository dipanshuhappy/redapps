import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Lucid, Blockfrost, Network, WalletApi } from "lucid-cardano";

interface AvailableWallet {
  id: string;
  name: string;
  icon: string;
  version: string;
  isConnected?: boolean;
}

// Define the shape of the context
interface CardanoContextProps {
  provider: Lucid | null;
  isConnected: boolean;
  isConnectLoading: boolean;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  wallets: AvailableWallet[];
}

// Create the context with an initial undefined value
const CardanoContext = createContext<CardanoContextProps | undefined>(
  undefined,
);

interface CardanoProviderProps {
  children: ReactNode;
  blockFrostPoviderId: string;
  network: Network;
}

const CardanoProvider: React.FC<CardanoProviderProps> = ({
  children,
  blockFrostPoviderId,
  network,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [lucid, setLucid] = useState<Lucid | null>(null);
  const [wallets, setWallets] = useState<AvailableWallet[]>([]);
  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const initLucid = async (walletName: string) => {
    const lucid = await Lucid.new(
      new Blockfrost(
        "https://cardano-preprod.blockfrost.io/api/v0",
        blockFrostPoviderId,
      ),
      network,
    );
    window.cardano[walletName].enable().then((a) => {
      console.log(a);
      lucid.selectWallet(a as any as WalletApi);
    });
    setLucid(lucid);
  };
  const connect = async (walletName: string) => {
    try {
      setIsConnectLoading(true);
      const wallet = wallets.find((a) => a.name === walletName);
      if (!wallet) throw new Error("Wallet not found");
      if (!window) throw new Error("window is not defined");
      if (!window.cardano) throw new Error("Cardano not found");
      await initLucid(wallet.id);

      setIsConnected(true);
    } catch (e) {
      setIsConnected(false);
      console.error(e);
    } finally {
      setIsConnectLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      if (!lucid) throw new Error("Lucid not found");
      setLucid(null);

      setIsConnected(false);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) {
      return;
    }
    if (window === void 0) throw new Error("window is not defined");
    if (window.cardano === void 0) setWallets([]);
    let newWallets = [];
    for (const key in window.cardano) {
      try {
        const _wallet = window.cardano[key];
        if (!_wallet) continue;
        if (!_wallet.name) continue;
        if (!_wallet.icon) continue;
        // if (!_wallet.version) continue;
        console.log(key, "kekkk");
        newWallets.push({
          id: key,
          name: key == "nufiSnap" ? "MetaMask" : _wallet.name,
          icon: _wallet.icon,
          version: _wallet.version,
          isConnected: false,
        });
      } catch (e) {}
    }
    console.log({ newWallets });
    setWallets(newWallets);
  }, [loaded]);

  return (
    <CardanoContext.Provider
      value={{
        connect,
        wallets,
        disconnect,
        isConnectLoading,
        isConnected,
        provider: lucid,
      }}
    >
      {children}
    </CardanoContext.Provider>
  );
};

// Custom hook to use the Cardano context
const useCardano = (): CardanoContextProps => {
  const context = useContext(CardanoContext);
  if (!context) {
    throw new Error("useCardano must be used within a CardanoProvider");
  }
  return context;
};

export { CardanoProvider, useCardano };
