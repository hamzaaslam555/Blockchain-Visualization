import React from 'react';
import { useSwipeable } from 'react-swipeable';

function WalletCard({ walletFile, onSelectWallet }) {
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const { absX } = eventData;
      const card = eventData.event.target.closest('.wallet-card');
      card.style.opacity = 1 - absX / 300; // Fade card based on swipe distance
    },
    onSwiped: (eventData) => {
      const card = eventData.event.target.closest('.wallet-card');
      card.style.opacity = 1; // Reset opacity after swipe
    },
    onSwipedRight: () => onSelectWallet(walletFile),
  });

  return (
    <div {...handlers} onClick={() => onSelectWallet(walletFile)} className="wallet-card" role="button" aria-label={`Select wallet ${walletFile}`}>
      <img src={`wallet.png`} alt="Wallet" />
      <p>{walletFile}</p>
    </div>
  );
}

export default WalletCard;