
import React from 'react';
import { GridPlugin, GridAPI } from '@/types/smartgrid';

interface PluginRendererProps {
  plugins: GridPlugin[];
  gridAPI: GridAPI;
  type: 'toolbar' | 'footer';
}

export function PluginRenderer({ plugins, gridAPI, type }: PluginRendererProps) {
  const relevantPlugins = plugins.filter(plugin => 
    type === 'toolbar' ? plugin.toolbar : plugin.footer
  );

  if (relevantPlugins.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {relevantPlugins.map(plugin => (
        <div key={`${type}-${plugin.id}`}>
          {type === 'toolbar' && plugin.toolbar ? plugin.toolbar(gridAPI) : null}
          {type === 'footer' && plugin.footer ? plugin.footer(gridAPI) : null}
        </div>
      ))}
    </div>
  );
}

interface PluginRowActionsProps {
  plugins: GridPlugin[];
  gridAPI: GridAPI;
  row: any;
  rowIndex: number;
}

export function PluginRowActions({ plugins, gridAPI, row, rowIndex }: PluginRowActionsProps) {
  const pluginsWithRowActions = plugins.filter(plugin => plugin.rowActions);
  
  if (pluginsWithRowActions.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {pluginsWithRowActions.map(plugin => (
        <div key={`row-action-${plugin.id}-${rowIndex}`}>
          {plugin.rowActions!(row, rowIndex, gridAPI)}
        </div>
      ))}
    </div>
  );
}
