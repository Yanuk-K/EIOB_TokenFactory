// Updated UI: single centered container with subtle animations
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const tokenFactoryAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
      }
    ],
    "name": "TokenCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      }
    ],
    "name": "createToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ----------------------------------------------------------------
// UI Component – sleek, modern and animated
// ----------------------------------------------------------------
export default function TokenCreator() {
  const [owner, setOwner] = useState("");
  const [supply, setSupply] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  // ----- NEW STATE -------------------------------------------------
  const [account, setAccount] = useState<string | null>(null);   // connected address
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // -----------------------------------------------------------------

  // ------------------------------------------------------------
  async function connectWallet() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
    } catch (e: any) {
      setError(e?.message ?? "Failed to connect wallet");
    }
  }

  // ------------------------------------------------------------
  async function createToken() {
    try {
      setError(null);
      setTxHash(null);
      setLoading(true);

      if (!account) throw new Error("Wallet not connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        "0x9479B9A62c4586F2327855F00631E79d1ADa83D3",
        tokenFactoryAbi,
        signer
      );

      const tx = await contract.createToken(owner, supply, name, symbol);
      setTxHash(tx.hash);
      await tx.wait();               // optional: wait for confirmation
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  // Add a simple fade‑in effect when the component mounts
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);

  return (
    <div style={styles.pageWrapper}>
      {/* Global CSS for keyframe animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>

      <div style={styles.container} className={show ? "fade-in" : undefined}>
        {/* Header */}
        <h2 style={styles.header}>🪙 EIOB Token Builder</h2>

        {/* Connect button – shown only when wallet not connected */}
        {!account && (
          <button style={styles.connectBtn} onClick={connectWallet} disabled={loading}>
            {loading ? "Connecting…" : "Connect MetaMask"}
          </button>
        )}

        {/* Connected address */}
        {account && (
          <p style={styles.connected}>Connected: {account}</p>
        )}

        {/* Form – displayed after wallet connection */}
        {account && (
          <div style={styles.form}>
            <label style={styles.label}>Initial Owner (address)</label>
            <input style={styles.input} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="0x..." />

            <label style={styles.label}>Initial Supply</label>
            <input style={styles.input} type="number" value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="e.g. 1 000 000" />

            <label style={styles.label}>Token Name</label>
            <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="My Token" />

            <label style={styles.label}>Symbol</label>
            <input style={styles.input} value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="MTK" />

            <button
              style={loading ? styles.btnDisabled : styles.createBtn}
              disabled={loading}
              onClick={createToken}
            >
              {loading ? "Creating…" : "Create Token"}
            </button>

            {txHash && (
              <p style={styles.success}>
                ✅ Transaction sent: 
                <a href={`http://eiobexplorer.yeunwook.kim/tx/${txHash}`} target="_blank" rel="noreferrer" style={styles.link}>
                  {txHash.slice(0, 12)}…{txHash.slice(-6)}
                </a>
              </p>
            )}

            {error && <p style={styles.error}>❌ {error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Modern inline styles – feel free to extract to a CSS/SCSS module later
// ----------------------------------------------------------------
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fa",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "2rem",
  },
  container: {
    width: "100%",
    maxWidth: "460px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 12px 24px rgba(0,0,0,.08)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  header: {
    margin: 0,
    textAlign: "center" as const,
    fontSize: "1.75rem",
    color: "#111827",
  },
  connectBtn: {
    padding: "0.85rem 1.2rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background .2s, transform .2s",
    alignSelf: "center",
    ':hover': { background: "#1e40af" },
  },
  connected: {
    background: "#e5e7eb",
    padding: "0.45rem 0.9rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    textAlign: "center" as const,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  label: { fontWeight: 500, fontSize: "0.95rem", color: "#374151" },
  input: {
    width: "100%",
    padding: "0.6rem 0.3rem",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    transition: "border-color .2s, box-shadow .2s",
    ':focus': { outline: "none", borderColor: "#2563eb", boxShadow: "0 0 0 2px rgba(37,99,235,.2)" },
  },
  createBtn: {
    marginTop: "0.5rem",
    padding: "0.85rem 1rem",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background .2s, transform .2s",
    ':hover': { background: "#059669" },
  },
  btnDisabled: {
    marginTop: "0.5rem",
    padding: "0.85rem 1rem",
    background: "#94a3b8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontSize: "1rem",
  },
  success: { color: "#065f46", wordBreak: "break-all" as const },
  error: { color: "#b91c1c" },
  link: { color: "#2563eb", textDecoration: "none" },
};