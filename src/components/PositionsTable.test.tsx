// src/components/PositionsTable.test.tsx
// src/components/PositionsTable.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PositionsTable from './PositionsTable';

const positions = {
  collateral: { USDC: 150n, BTC: 50n },
  debt:       { USDC: 100n, BTC: 100n },
};

test('renders table with correct health badges', () => {
  render(<PositionsTable positions={positions} />);

  // Asset names
  expect(screen.getByText('USDC')).toBeInTheDocument();
  expect(screen.getByText('BTC')).toBeInTheDocument();

  // Collateral
  expect(screen.getByText('150')).toBeInTheDocument();
  expect(screen.getByText('50')).toBeInTheDocument();

  const debts = screen.getAllByText('100');
  expect(debts).toHaveLength(2);


  expect(screen.getByText(/^150\.00\s*%$/)).toBeInTheDocument();
  // Cerchiamo 50.00% esatto (regex inizio-fine)
  expect(screen.getByText(/^50\.00\s*%$/)).toBeInTheDocument();
 });