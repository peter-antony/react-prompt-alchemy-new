
import React from 'react';
import { DynamicPanel } from './DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';

export const DynamicPanelPreview: React.FC = () => {
  // Sample data matching the uploaded images
  const basicDetailsConfig: PanelConfig = {
    resource: {
      id: 'resource',
      label: 'Resource',
      fieldType: 'select',
      value: 'Vehicle',
      mandatory: true,
      visible: true,
      editable: true,
      order: 1,
      options: [
        { label: 'Vehicle', value: 'Vehicle' },
        { label: 'Equipment', value: 'Equipment' },
        { label: 'Personnel', value: 'Personnel' }
      ]
    },
    resourceType: {
      id: 'resourceType',
      label: 'Resource Type',
      fieldType: 'select',
      value: 'Truck 4.5T',
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: 'Truck 4.5T', value: 'Truck 4.5T' },
        { label: 'Van 3.5T', value: 'Van 3.5T' },
        { label: 'Truck 7.5T', value: 'Truck 7.5T' }
      ]
    },
    serviceType: {
      id: 'serviceType',
      label: 'Service Type',
      fieldType: 'select',
      value: 'Block Train Conventional',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      options: [
        { label: 'Block Train Conventional', value: 'Block Train Conventional' },
        { label: 'Single Wagon', value: 'Single Wagon' },
        { label: 'Combined Transport', value: 'Combined Transport' }
      ]
    },
    subService: {
      id: 'subService',
      label: 'Sub-Service',
      fieldType: 'select',
      value: 'Repair',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      options: [
        { label: 'Repair', value: 'Repair' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Inspection', value: 'Inspection' }
      ]
    }
  };

  const operationalDetailsConfig: PanelConfig = {
    operationalLocation: {
      id: 'operationalLocation',
      label: 'Operational Location',
      fieldType: 'search',
      value: 'Frankfurt Station',
      mandatory: true,
      visible: true,
      editable: true,
      order: 1,
      placeholder: 'Search location...'
    },
    departurePoint: {
      id: 'departurePoint',
      label: 'Departure Point',
      fieldType: 'select',
      value: '10-000471',
      mandatory: true,
      visible: true,
      editable: true,
      order: 2,
      options: [
        { label: '10-000471', value: '10-000471' },
        { label: '10-000472', value: '10-000472' },
        { label: '10-000473', value: '10-000473' }
      ]
    },
    arrivalPoint: {
      id: 'arrivalPoint',
      label: 'Arrival Point',
      fieldType: 'select',
      value: '10-000720',
      mandatory: true,
      visible: true,
      editable: true,
      order: 3,
      options: [
        { label: '10-000720', value: '10-000720' },
        { label: '10-000721', value: '10-000721' },
        { label: '10-000722', value: '10-000722' }
      ]
    },
    fromDate: {
      id: 'fromDate',
      label: 'From Date',
      fieldType: 'date',
      value: '2025-03-12',
      mandatory: true,
      visible: true,
      editable: true,
      order: 4
    },
    fromTime: {
      id: 'fromTime',
      label: 'From Time',
      fieldType: 'time',
      value: '08:00:00',
      mandatory: true,
      visible: true,
      editable: true,
      order: 5
    },
    toDate: {
      id: 'toDate',
      label: 'To Date',
      fieldType: 'date',
      value: '2025-03-12',
      mandatory: true,
      visible: true,
      editable: true,
      order: 6
    },
    toTime: {
      id: 'toTime',
      label: 'To Time',
      fieldType: 'time',
      value: '10:00:00',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7
    },
    remarks: {
      id: 'remarks',
      label: 'Remarks',
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      placeholder: 'Enter Remarks'
    }
  };

  const billingDetailsConfig: PanelConfig = {
    contractPrice: {
      id: 'contractPrice',
      label: 'Contract Price',
      fieldType: 'currency',
      value: '1200.00',
      mandatory: true,
      visible: true,
      editable: false,
      order: 1
    },
    netAmount: {
      id: 'netAmount',
      label: 'Net Amount',
      fieldType: 'currency',
      value: '5580.00',
      mandatory: true,
      visible: true,
      editable: false,
      order: 2
    },
    billingType: {
      id: 'billingType',
      label: 'Billing Type',
      fieldType: 'select',
      value: 'Wagon',
      mandatory: true,
      visible: true,
      editable: true,
      order: 3,
      options: [
        { label: 'Wagon', value: 'Wagon' },
        { label: 'Container', value: 'Container' },
        { label: 'Block', value: 'Block' }
      ]
    },
    unitPrice: {
      id: 'unitPrice',
      label: 'Unit Price',
      fieldType: 'currency',
      value: '1395.00',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4
    },
    billingQty: {
      id: 'billingQty',
      label: 'Billing Qty.',
      fieldType: 'text',
      value: '4',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5
    },
    tariff: {
      id: 'tariff',
      label: 'Tariff',
      fieldType: 'search',
      value: 'TAR000750 - Tariff Description',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
      placeholder: 'Search tariff...'
    },
    tariffType: {
      id: 'tariffType',
      label: 'Tariff Type',
      fieldType: 'text',
      value: 'Rate Per Block Train',
      mandatory: false,
      visible: true,
      editable: false,
      order: 7
    },
    billingRemarks: {
      id: 'billingRemarks',
      label: 'Remarks',
      fieldType: 'textarea',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
      placeholder: 'Enter Remarks'
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <DynamicPanel
        panelId="basic-details-preview"
        panelTitle="Basic Details"
        panelConfig={basicDetailsConfig}
        panelWidth={4}
        showPreview={true}
      />
      <DynamicPanel
        panelId="operational-details-preview"
        panelTitle="Operational Details"
        panelConfig={operationalDetailsConfig}
        panelWidth={4}
        showPreview={true}
      />
      <DynamicPanel
        panelId="billing-details-preview"
        panelTitle="Billing Details"
        panelConfig={billingDetailsConfig}
        panelWidth={4}
        showPreview={true}
      />
    </div>
  );
};
