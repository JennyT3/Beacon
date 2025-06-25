// File: app/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useSWR from "swr";

import { useFreighter } from "../hooks/useFreighter";
import { Pool } from "@blend-capital/blend-sdk";
import PositionsTable from "../components/PositionsTable";
import { calculateHealthFactor } from "../lib/health";

const rpcUrl = "https://soroban-testnet.stellar.org";
const passphrase = "Test SDF Network ; September 2015";
const POOL_ID = process.env.NEXT_PUBLIC_BLEND_POOL_ID || "REPLACE_WITH_REAL_POOL_ID";

// Definizione del tipo per le posizioni
interface Positions {
  collateral: Record<string, bigint>;
  debt: Record<string, bigint>;
}

export default function Home() {
  const { publicKey, connectWallet, loading, error, available } = useFreighter();
  const [alerts, setAlerts] = useState<Record<string, boolean>>({});
  const [mockMode, setMockMode] = useState(false);
  const [mockCollateral, setMockCollateral] = useState<string>("200");
  const [mockDebt, setMockDebt] = useState<string>("150");

  const fetchUser = async () => {
    if (!publicKey) return null;
    const pool = await Pool.load({ rpc: rpcUrl, passphrase }, POOL_ID);
    const user = await pool.loadUser(publicKey);
    return user;
  };

  const { data: user } = useSWR(
    publicKey ? ["positions", publicKey] : null,
    fetchUser,
    { refreshInterval: 5000 }
  );

  const rawPositions =
    (user?.positions as unknown as { collateral: Record<string, bigint>; debt?: Record<string, bigint> }) ||
    { collateral: {}, debt: {} };

  const positions: Positions = mockMode
    ? { collateral: { MOCK: BigInt(mockCollateral) }, debt: { MOCK: BigInt(mockDebt) } }
    : { collateral: rawPositions.collateral, debt: rawPositions.debt ?? {} };

  useEffect(() => {
    if (!positions.collateral || !positions.debt) return;

    const LIQUIDATION_THRESHOLD = 100;
    const NEAR_LIQ_THRESHOLD = 110;

    Object.entries(positions.collateral).forEach(([asset, collateral]) => {
      const debt = positions.debt[asset] || 0n;
      const hf = calculateHealthFactor(collateral, debt);

      if (hf <= LIQUIDATION_THRESHOLD && !alerts[asset]) {
        toast.error(
          `${asset} under-collateralized: collateralization ${hf.toFixed(2)}% — at risk of liquidation!`
        );
        setAlerts(prev => ({ ...prev, [asset]: true }));
      } else if (
        hf <= NEAR_LIQ_THRESHOLD && hf > LIQUIDATION_THRESHOLD &&
        !alerts[`${asset}-near`]
      ) {
        toast(
          `${asset} close to liquidation: collateralization ${hf.toFixed(2)}%`,
          { icon: '⚠️' }
        );
        setAlerts(prev => ({ ...prev, [`${asset}-near`]: true }));
      } else if (hf <= 150 && hf > NEAR_LIQ_THRESHOLD && !alerts[asset]) {
        toast(
          `${asset} position at risk: collateralization ${hf.toFixed(2)}%`
        );
        setAlerts(prev => ({ ...prev, [asset]: true }));
      }
    });
  }, [positions, alerts]);

  const NEAR_LIQ_THRESHOLD = 110;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Stellar Blend Positions</h1>

      {/* Blinking banner per alert */}
      {Object.entries(positions.collateral).some(([asset, col]) => {
        const debt = positions.debt[asset] || 0n;
        const hf = calculateHealthFactor(col, debt);
        return hf <= NEAR_LIQ_THRESHOLD;
      }) && (
        <div className="mb-4 p-4 bg-red-600 text-white text-center font-bold animate-pulse">
          <p>Attenzione: alcune posizioni sono vicine alla liquidazione!</p>
        </div>
      )}

      {/* Debug: modalità mock */}
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <label className="inline-flex items-center mr-4">
          <input
            type="checkbox"
            checked={mockMode}
            onChange={() => setMockMode(!mockMode)}
            className="form-checkbox"
          />
          <span className="ml-2">Mock mode</span>
        </label>
        {mockMode && (
          <div className="space-x-4">
            <label>
              Collateral:
              <input
                type="number"
                value={mockCollateral}
                onChange={e => setMockCollateral(e.target.value)}
                className="ml-2 border rounded px-2"
              />
            </label>
            <label>
              Debt:
              <input
                type="number"
                value={mockDebt}
                onChange={e => setMockDebt(e.target.value)}
                className="ml-2 border rounded px-2"
              />
            </label>
          </div>
        )}
      </div>

      {/* Stato wallet */}
      {!available && <p className="text-red-500 mb-4">Freighter non rilevato</p>}
      {available && !publicKey && !loading && (
        <p className="text-yellow-600 mb-4">Wallet rilevato ma non connesso</p>
      )}
      {publicKey && <p className="text-green-600 mb-4">Connesso: {publicKey}</p>}

      {/* Bottone di connessione */}
      {!publicKey && available && (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}

      {/* Errori */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Contenuto principale */}
      {publicKey && positions.collateral && positions.debt && (
        <PositionsTable positions={positions} />
      )}
    </div>
  );
}
