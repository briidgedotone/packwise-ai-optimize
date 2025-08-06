import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Plus, Trash2, Package, Edit2, Check, X } from 'lucide-react';
import { type PackageType } from '@/lib/calculations/packaging';

interface ContainerConfiguratorProps {
  containers: PackageType[];
  onContainersChange: (containers: PackageType[]) => void;
  onPresetLoad?: (preset: 'standard' | 'express' | 'economy') => void;
}

interface EditableContainer extends PackageType {
  isEditing?: boolean;
}

export const ContainerConfigurator: React.FC<ContainerConfiguratorProps> = ({
  containers,
  onContainersChange,
  onPresetLoad
}) => {
  const [editableContainers, setEditableContainers] = useState<EditableContainer[]>(containers);

  const handleAddContainer = () => {
    const newContainer: EditableContainer = {
      id: `custom-${Date.now()}`,
      name: 'New Container',
      dimensions: { length: 12, width: 10, height: 8, unit: 'in' },
      maxWeight: 20,
      cost: 1.50,
      category: 'Custom',
      isEditing: true
    };
    
    const updated = [...editableContainers, newContainer];
    setEditableContainers(updated);
  };

  const handleEditContainer = (index: number) => {
    const updated = [...editableContainers];
    updated[index].isEditing = true;
    setEditableContainers(updated);
  };

  const handleSaveContainer = (index: number) => {
    const updated = [...editableContainers];
    updated[index].isEditing = false;
    setEditableContainers(updated);
    onContainersChange(updated.map(({ isEditing, ...container }) => container));
  };

  const handleCancelEdit = (index: number) => {
    const updated = [...editableContainers];
    if (updated[index].id.startsWith('custom-') && updated[index].isEditing) {
      // Remove if it's a new container being cancelled
      updated.splice(index, 1);
    } else {
      updated[index].isEditing = false;
    }
    setEditableContainers(updated);
  };

  const handleDeleteContainer = (index: number) => {
    const updated = editableContainers.filter((_, i) => i !== index);
    setEditableContainers(updated);
    onContainersChange(updated.map(({ isEditing, ...container }) => container));
  };

  const handleContainerChange = (index: number, field: string, value: any) => {
    const updated = [...editableContainers];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index] = {
        ...updated[index],
        [parent]: {
          ...updated[index][parent as keyof PackageType],
          [child]: value
        }
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    setEditableContainers(updated);
  };

  const handlePresetLoad = (preset: 'standard' | 'express' | 'economy') => {
    if (onPresetLoad) {
      onPresetLoad(preset);
    }
  };

  const calculateVolume = (container: PackageType): number => {
    const { length, width, height } = container.dimensions;
    return length * width * height;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Container Configuration
        </CardTitle>
        <CardDescription>
          Customize your available container types for optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Options */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetLoad('standard')}
            >
              Standard Mix
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetLoad('express')}
            >
              Express Shipping
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetLoad('economy')}
            >
              Economy Focus
            </Button>
          </div>
        </div>

        {/* Container List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Available Containers</Label>
            <Button size="sm" onClick={handleAddContainer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Container
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {editableContainers.map((container, index) => (
              <div
                key={container.id}
                className={`p-4 border rounded-lg ${
                  container.isEditing ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {container.isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Container Name</Label>
                        <Input
                          value={container.name}
                          onChange={(e) => handleContainerChange(index, 'name', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Input
                          value={container.category}
                          onChange={(e) => handleContainerChange(index, 'category', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Length (in)</Label>
                        <Input
                          type="number"
                          value={container.dimensions.length}
                          onChange={(e) => handleContainerChange(index, 'dimensions.length', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Width (in)</Label>
                        <Input
                          type="number"
                          value={container.dimensions.width}
                          onChange={(e) => handleContainerChange(index, 'dimensions.width', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Height (in)</Label>
                        <Input
                          type="number"
                          value={container.dimensions.height}
                          onChange={(e) => handleContainerChange(index, 'dimensions.height', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max Weight (lb)</Label>
                        <Input
                          type="number"
                          value={container.maxWeight}
                          onChange={(e) => handleContainerChange(index, 'maxWeight', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Cost ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={container.cost}
                          onChange={(e) => handleContainerChange(index, 'cost', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveContainer(index)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelEdit(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{container.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {container.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">Dimensions:</span><br />
                          {container.dimensions.length}" × {container.dimensions.width}" × {container.dimensions.height}"
                        </div>
                        <div>
                          <span className="text-gray-500">Volume:</span><br />
                          {calculateVolume(container).toFixed(0)} cu in
                        </div>
                        <div>
                          <span className="text-gray-500">Max Weight:</span><br />
                          {container.maxWeight} lbs
                        </div>
                        <div>
                          <span className="text-gray-500">Cost:</span><br />
                          ${container.cost.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditContainer(index)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {container.id.startsWith('custom-') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteContainer(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>{editableContainers.length}</strong> containers configured •{' '}
            <strong>{editableContainers.filter(c => c.id.startsWith('custom-')).length}</strong> custom containers •{' '}
            Volume range: <strong>{Math.min(...editableContainers.map(calculateVolume)).toFixed(0)}</strong> - <strong>{Math.max(...editableContainers.map(calculateVolume)).toFixed(0)}</strong> cu in
          </div>
        </div>
      </CardContent>
    </Card>
  );
};