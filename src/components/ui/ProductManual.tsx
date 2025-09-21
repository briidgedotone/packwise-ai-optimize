import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  XMarkIcon as X,
  InformationCircleIcon as Info,
} from '@heroicons/react/24/outline';

interface ManualSection {
  title: string;
  icon: string;
  items: string[];
}

interface ProductManualProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productIcon: React.ReactNode;
  sections: ManualSection[];
}

export const ProductManual: React.FC<ProductManualProps> = ({
  isOpen,
  onClose,
  productName,
  productIcon,
  sections
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
              {productIcon}
            </div>
            {productName} Manual
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-gray-700">
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div key={index}>
                      <strong className="text-gray-900">{section.icon} {section.title}:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};