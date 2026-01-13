import React, { useState } from 'react';
import { EditableField } from './EditableField';
import { Platform, FieldType } from '../services/validationService';
import { FieldInfoTooltip } from '../src/components/FieldInfoTooltip';

interface OutputSectionProps {
  title: string;
  items: string[];
  platform?: Platform;
  fieldType?: FieldType;
  adCopyId?: string;
  campaignPurpose?: string;
  onUpdate?: (index: number, newValue: string) => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({
  title,
  items,
  platform = 'meta',
  fieldType = 'primaryText',
  adCopyId,
  campaignPurpose,
  onUpdate
}) => {
  const [localItems, setLocalItems] = useState<string[]>(items);

  const handleSave = (index: number, newValue: string) => {
    const updatedItems = [...localItems];
    updatedItems[index] = newValue;
    setLocalItems(updatedItems);

    if (onUpdate) {
      onUpdate(index, newValue);
    }
  };

  if (!localItems || localItems.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
        {title}
        <FieldInfoTooltip platform={platform} fieldType={fieldType} />
      </h3>
      <div className="space-y-3">
        {localItems.map((item, index) => (
          <EditableField
            key={index}
            value={item}
            fieldType={fieldType}
            platform={platform}
            fieldLabel={`${title} #${index + 1}`}
            onSave={(newValue) => handleSave(index, newValue)}
            adCopyId={adCopyId}
            campaignPurpose={campaignPurpose}
          />
        ))}
      </div>
    </div>
  );
};

export default OutputSection;