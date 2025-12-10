import React from 'react';

// Official WhatsApp Icon SVG
const WhatsAppIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.654-.698c.93.509 1.769.739 2.805.74h.003c3.181-.001 5.767-2.587 5.768-5.766.001-3.183-2.578-5.827-5.77-5.827zm-9.199 5.767c0-5.079 4.132-9.207 9.204-9.207 5.062 0 9.192 4.129 9.192 9.207 0 5.063-4.116 9.207-9.192 9.207-1.544 0-3.025-.386-4.343-.786l-4.693 1.238 1.25-4.568c-1.069-1.515-1.418-2.944-1.418-4.891zm12.944 2.877c-.208-.104-1.233-.608-1.424-.678-.19-.069-.329-.104-.467.104-.139.208-.537.678-.658.816-.121.139-.242.156-.45.052-.208-.104-.878-.323-1.673-1.032-.619-.552-1.038-1.234-1.159-1.442-.121-.208-.013-.321.091-.424.093-.094.208-.243.312-.365.104-.121.139-.208.208-.347.069-.139.035-.26-.017-.365-.052-.104-.468-1.128-.641-1.544-.169-.406-.341-.351-.468-.358-.121-.006-.26-.006-.399-.006-.139 0-.364.052-.555.26-.19.208-.728.711-.728 1.734 0 1.022.745 2.011.849 2.149.104.139 1.465 2.237 3.548 3.136 2.084.899 2.084.6 2.465.563.381-.038 1.233-.504 1.407-.99.173-.487.173-.903.121-.99-.052-.087-.19-.139-.399-.243z"/>
  </svg>
);

const WhatsAppButton = ({ 
  phoneNumber, 
  message, 
  label = "Chat on WhatsApp", 
  small = false,
  className = "" // Allow custom classes from parent
}) => {
  
  const handleChat = (e) => {
    e.stopPropagation(); // Prevent parent click (like card navigation)
    
    if (!phoneNumber) {
      alert("Phone number not available for this user.");
      return;
    }

    // 1. Clean Number
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // 2. Add Country Code if missing (India default)
    if (cleanNumber.length === 10) {
      cleanNumber = '91' + cleanNumber;
    }

    // 3. Construct URL
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    // 4. Open
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleChat}
      className={`
        flex items-center justify-center font-bold text-white rounded-xl shadow-md transition-all transform active:scale-95
        bg-[#25D366] hover:bg-[#20bd5a] hover:shadow-lg
        ${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-3 text-sm w-full'}
        ${className}
      `}
    >
      <WhatsAppIcon className={`fill-current ${small ? 'w-4 h-4 mr-1.5' : 'w-5 h-5 mr-2'}`} />
      {label}
    </button>
  );
};

export default WhatsAppButton;