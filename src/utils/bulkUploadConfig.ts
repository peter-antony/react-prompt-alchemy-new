import { ColumnConfig } from '@/types/BulkUpload';

// Excel header mappings to  {
    
export const excelColumnMappings = {
  'Wagon Type': 'WagonType',
  'Wagon ID': 'Wagon',
  'Wagon Qty UOM': 'WagonQtyUOM',
  'Wagon Qty': 'WagonQty',
  'NHM': 'NHM',
  'Product ID': 'Product',
  'Product Weight UOM': 'ProductWeightUOM',
  'Product Weight': 'ProductWeight',
  'UN Code': 'UNCode',
  'DG Class': 'DGClass',
  'Contains Hazardous Goods': 'ContainsHazardousGoods',
  'Wagon Tare Weight UOM': 'WagonTareWeightUOM',
  'Wagon Tare Weight': 'WagonTareWeight',
  'Wagon Gross Weight UOM': 'GrossWeightUOM',
  'Wagon Gross Weight': 'GrossWeight',
  'Wagon Length UOM': 'WagonLengthUOM',
  'Wagon Length': 'WagonLength',
  'Shunting Option': 'ShuntingOption',
  'Replaced Wagon': 'ReplacedWagon',
  'Shunting Reason Code': 'ShuntingReasonCode',
  'Shunt In Location': 'ShuntInLocationDescription',
  'Shunt Out Location': 'ShuntOutLocationDescription',
  'Shunt In Date': 'ShuntInDate',
  'Shunt In Time': 'ShuntInTime',
  'Shunt Out Date': 'ShuntOutDate',
  'Shunt Out Time': 'ShuntOutTime',
  'Wagon Position': 'WagonPosition',
  'Wagon Seal No.': 'WagonSealNo',
  'Container ID': 'ContainerId',
  'Container Type': 'ContainerType',
  'Container Qty UOM': 'ContainerQtyUOM',
  'Container Qty': 'ContainerQty',
  'Container Tare Weight UOM': 'ContainerTareWeightUOM',
  'Container Tare Weight': 'ContainerTareWeight',
  'Container Seal No.': 'ContainerSealNo',
  'THU ID': 'Thu',
  'THU Serial No': 'ThuSerialNo',
  'THU Qty UOM': 'ThuQtyUOM',
  'THU Qty': 'ThuQty',
  'THU Weight UOM': 'ThuWeightUOM',
  'THU Weight': 'ThuWeight',
  'Class Of Stores': 'ClassOfStores',
  'Last Product Transported 1': 'LastProductTransported1',
  'Last Product Transported 2': 'LastProductTransported2',
  'Last Product Transported 3': 'LastProductTransported3',
  'Quick Code 1': 'QuickCode1',
  'Quick Code 2': 'QuickCode2',
  'Quick Code 3': 'QuickCode3',
  'Quick Code Value 1': 'QuickCodeValue1',
  'Quick Code Value 2': 'QuickCodeValue2',
  'Quick Code Value 3': 'QuickCodeValue3',
  'Remarks1': 'Remarks1',
  'Remarks2': 'Remarks2',
  'Remarks3': 'Remarks3'
};

// Column configuration for bulk upload validation
export const bulkUploadColumnsConfig: ColumnConfig[] = [
  {
    fieldName: 'Wagon ID',
    displayName: 'Wagon ID',
    validationRules: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 50
    }
  },
  {
    fieldName: 'Wagon Tare Weight',
    displayName: 'Wagon Tare Weight',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Wagon Gross Weight',
    displayName: 'Wagon Gross Weight',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Container ID',
    displayName: 'Container ID',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Product ID',
    displayName: 'Product ID',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Product Description',
    displayName: 'Product Description',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 255
    }
  },
  {
    fieldName: 'Product Weight Qty',
    displayName: 'Product Weight Qty',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Product Weight Qty UOM',
    displayName: 'Product Weight Qty UOM',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 10
    }
  },
  {
    fieldName: 'Wagon Position',
    displayName: 'Wagon Position',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 20
    }
  },
  {
    fieldName: 'Wagon Type',
    displayName: 'Wagon Type',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 20
    }
  },
  {
    fieldName: 'Wagon Length',
    displayName: 'Wagon Length',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Wagon Qty',
    displayName: 'Wagon Qty',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Wagon Qty UOM',
    displayName: 'Wagon Qty UOM',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 10
    }
  },
  {
    fieldName: 'Container Type',
    displayName: 'Container Type',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 20
    }
  },
  {
    fieldName: 'Container Qty',
    displayName: 'Container Qty',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Container Qty UOM',
    displayName: 'Container Qty UOM',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 10
    }
  },
  {
    fieldName: 'THU ID',
    displayName: 'THU ID',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'THU Serial No',
    displayName: 'THU Serial No',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'THU Qty',
    displayName: 'THU Qty',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'THU Weight',
    displayName: 'THU Weight',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'THU Weight UOM',
    displayName: 'THU Weight UOM',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 10
    }
  },

  {
    fieldName: 'Shunting Option',
    displayName: 'Shunting Option',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Replaced Wagon ID',
    displayName: 'Replaced Wagon ID',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Shunting Reason Code',
    displayName: 'Shunting Reason Code',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Shunt In Location',
    displayName: 'Shunt In Location',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 100
    }
  },
  {
    fieldName: 'Shunt Out Location',
    displayName: 'Shunt Out Location',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 100
    }
  },
  {
    fieldName: 'Class Of Stores',
    displayName: 'Class Of Stores',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'NHM',
    displayName: 'NHM',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'UN Code',
    displayName: 'UN Code',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 20
    }
  },
  {
    fieldName: 'DG Class',
    displayName: 'DG Class',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 20
    }
  },
  {
    fieldName: 'Contains Hazardous Goods',
    displayName: 'Contains Hazardous Goods',
    validationRules: {
      type: 'string',
      required: false,
      customValidator: (value: string) => {
        if (value && !['Yes', 'No', 'yes', 'no', 'Y', 'N', 'y', 'n', '1', '0', 'true', 'false'].includes(value.toString())) {
          return 'Must be Yes/No, Y/N, 1/0, or true/false';
        }
        return null;
      }
    }
  },
  {
    fieldName: 'Wagon Seal No.',
    displayName: 'Wagon Seal No.',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Container Seal No.',
    displayName: 'Container Seal No.',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Remarks1',
    displayName: 'Remarks1',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 500
    }
  },
  {
    fieldName: 'Remarks2',
    displayName: 'Remarks2',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 500
    }
  },
  {
    fieldName: 'Remarks3',
    displayName: 'Remarks3',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 500
    }
  }
];

// Function to map Excel data to response structure format
export function mapExcelDataToResponseFormat(excelData: any[]): any[] {
  return excelData.map((row, index) => {
    const mappedRow: any = {
      // Default structure with nulls as per the provided format
      ClassOfStores: null,
      ContainerDescription: null,
      ContainerId: null,
      ContainerQty: null,
      ContainerQtyUOM: null,
      ContainerSealNo: "",
      ContainerTareWeight: null,
      ContainerTareWeightUOM: null,
      ContainerType: null,
      ContainsHazardousGoods: null,
      DGClass: null,
      DGClassDescription: null,
      GrossWeight: 0,
      GrossWeightUOM: "TON",
      LastCommodityTransported1: null,
      LastCommodityTransported2: null,
      LastCommodityTransported3: null,
      LastCommodityTransportedDate1: null,
      LastCommodityTransportedDate2: null,
      LastCommodityTransportedDate3: null,
      ModeFlag: "Nochange",
      NHM: null,
      NHMDescription: null,
      PlanToActualCopy: null,
      Product: null,
      ProductDescription: null,
      ProductWeight: null,
      ProductWeightUOM: null,
      QuickCode1: null,
      QuickCode2: null,
      QuickCode3: null,
      QuickCodeValue1: "",
      QuickCodeValue2: "",
      QuickCodeValue3: "",
      Remarks: null,
      Remarks1: null,
      Remarks2: null,
      Remarks3: null,
      ReplacedWagon: null,
      Seqno: (index + 1).toString(),
      ShuntInDate: null,
      ShuntInLocation: null,
      ShuntInLocationDescription: "UD",
      ShuntInTime: null,
      ShuntOutDate: null,
      ShuntOutLocation: null,
      ShuntOutLocationDescription: "UD",
      ShuntOutTime: null,
      ShuntingOption: null,
      ShuntingReasonCode: null,
      Thu: null,
      ThuDescription: null,
      ThuQty: null,
      ThuSerialNo: "",
      ThuWeight: null,
      ThuWeightUOM: null,
      UNCode: null,
      UNCodeDescription: null,
      Wagon: "B-01234", // Default value
      WagonDescription: "B-01234",
      WagonLength: "5.00000000",
      WagonLengthUOM: "M",
      WagonPosition: null,
      WagonQty: 1,
      WagonQtyUOM: null,
      WagonSealNo: "",
      WagonTareWeight: 0,
      WagonTareWeightUOM: "TON",
      WagonType: "A"
    };

    // Map Excel columns to response structure
    Object.entries(excelColumnMappings).forEach(([excelColumn, responseField]) => {
      if (row[excelColumn] !== undefined && row[excelColumn] !== null && row[excelColumn] !== '') {
        const value = row[excelColumn];
        
        // Handle special cases for boolean fields
        if (responseField === 'ContainsHazardousGoods') {
          if (['Yes', 'yes', 'Y', 'y', '1', 'true'].includes(value.toString())) {
            mappedRow[responseField] = true;
          } else if (['No', 'no', 'N', 'n', '0', 'false'].includes(value.toString())) {
            mappedRow[responseField] = false;
          } else {
            mappedRow[responseField] = null;
          }
        }
        // Handle date fields
        else if (responseField === 'ShuntInDate' || responseField === 'ShuntOutDate') {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              mappedRow[responseField] = date.toISOString().split('T')[0]; // YYYY-MM-DD format
              // Extract time component if present
              if (responseField === 'ShuntInDate') {
                mappedRow['ShuntInTime'] = date.toISOString().split('T')[1]?.split('.')[0] || null;
              } else if (responseField === 'ShuntOutDate') {
                mappedRow['ShuntOutTime'] = date.toISOString().split('T')[1]?.split('.')[0] || null;
              }
            }
          } catch (error) {
            mappedRow[responseField] = null;
          }
        }
        // Handle numeric fields
        else if (['WagonTareWeight', 'GrossWeight', 'ProductWeight', 'ThuQty', 'ThuWeight', 'WagonQty', 'ContainerQty', 'WagonLength'].includes(responseField)) {
          const numValue = parseFloat(value);
          mappedRow[responseField] = isNaN(numValue) ? null : numValue;
        }
        // Handle string fields
        else {
          mappedRow[responseField] = value.toString();
        }
      }
    });

    // Set Wagon and WagonDescription to the same value
    if (mappedRow.Wagon) {
      mappedRow.WagonDescription = mappedRow.Wagon;
    }

    return mappedRow;
  });
}