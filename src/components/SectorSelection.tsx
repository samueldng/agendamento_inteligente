import React from 'react';
import { useSector, SECTORS } from '../hooks/useSector.tsx';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function SectorSelection() {
  const { setSector } = useSector();

  const handleSectorSelect = (sectorId: string) => {
    setSector(sectorId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Sis IA Go
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Escolha o setor do seu negócio para começar
          </p>
          <p className="text-sm text-gray-500">
            Cada setor possui funcionalidades específicas para otimizar sua gestão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTORS.map((sector) => (
            <div key={sector.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-4xl">{sector.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{sector.name}</h3>
                    <p className="text-sm text-gray-600">{sector.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sector.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button 
                  onClick={() => handleSectorSelect(sector.id)}
                  className={`w-full ${sector.color} hover:opacity-90 text-white`}
                >
                  Selecionar {sector.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Você pode alterar o setor a qualquer momento nas configurações
          </p>
        </div>
      </div>
    </div>
  );
}