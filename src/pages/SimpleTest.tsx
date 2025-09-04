import React from 'react';

export function SimpleTest() {
  console.log('🔥 SIMPLE TEST: Component mounted!');
  
  const handleClick = () => {
    console.log('🔥 SIMPLE TEST: Button clicked!');
    alert('Botão funcionando!');
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste Simples</h1>
      <p>Se você está vendo esta página, o React está funcionando!</p>
      <button 
        onClick={handleClick}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Testar Clique
      </button>
    </div>
  );
}