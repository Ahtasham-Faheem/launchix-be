import React from 'react';

export default function PaymentCancel() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4 text-orange-600">Payment Cancelled</h2>
      <p className="mb-4">You cancelled the payment. You can try again anytime.</p>
      <button 
        onClick={() => window.location.href = '/'} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back to Plans
      </button>
    </div>
  );
}