// components/PositionsTable.tsx
import React from "react";
import { calculateHealthFactor, getHealthStatus, HEALTH_STATUS } from "../lib/health";

interface PositionsTableProps {
  positions: {
    collateral: Record<string, bigint>;
    debt: Record<string, bigint>;
  } | null;
}

const PositionsTable: React.FC<PositionsTableProps> = ({ positions }) => {
  if (!positions) return <p>Loading positions...</p>;

  const rows = Object.entries(positions.collateral).map(([asset, collateral]) => {
    const debt = positions.debt[asset] || 0n;
    const hf = calculateHealthFactor(collateral, debt);
    const status = getHealthStatus(hf);

    const badgeColor =
      status === HEALTH_STATUS.HEALTHY
        ? "bg-green-500"
        : status === HEALTH_STATUS.WARNING
        ? "bg-yellow-500"
        : "bg-red-500";

    return (
      <tr key={asset}>
        <td className="py-2">{asset}</td>
        <td className="py-2">{collateral.toString()}</td>
        <td className="py-2">{debt.toString()}</td>
        <td className="py-2">
          <span className={`px-2 py-1 text-white rounded ${badgeColor}`}>
            {hf.toFixed(2)}%
          </span>
        </td>
      </tr>
    );
  });

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          <th className="py-2">Asset</th>
          <th className="py-2">Collateral</th>
          <th className="py-2">Debt</th>
          <th className="py-2">Health Factor</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

export default PositionsTable;
