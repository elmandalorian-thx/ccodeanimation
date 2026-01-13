import React from 'react';
import { GoogleToolsLayout } from '../src/components/google-tools/GoogleToolsLayout';

interface GoogleToolsProps {
  initialTool?: string;
}

const GoogleTools: React.FC<GoogleToolsProps> = ({ initialTool }) => {
  return <GoogleToolsLayout initialTool={initialTool} />;
};

export default GoogleTools;
