import { ColumnConfig } from '@/types/BulkUpload';

// Excel header mappings to the response structure fields
export const excelColumnMappings = {
  'Wagon ID': 'Wagon',
  'Tare Weight': 'WagonTareWeight',
  'Gross Weight': 'GrossWeight', 
  'Container ID': 'ContainerId',
  'Product ID': 'ProductId',
  'Product Weight UOM': 'ProductWeightUOM',
  'Product Weight': 'ProductWeight',
  'Wagon Position': 'WagonPosition',
  'Wagon Type': 'WagonType',
  'Wagon length': 'WagonLength',
  'Wagon Qty': 'WagonQty',
  'Wagon Qty UOM': 'WagonQtyUOM',
  'Container Type': 'ContainerType',
  'Container Qty': 'ContainerQty',
  'Container Qty UOM': 'ContainerQtyUOM',
  'THU ID': 'Thu',
  'THU Serial No': 'ThuSerialNo',
  'THU Qty': 'ThuQty',
  'THU Weight': 'ThuWeight',
  'THU Weight UOM': 'ThuWeightUOM',
  'Shunting Option': 'ShuntingOption',
  'Replaced Wagon ID': 'ReplacedWagon',
  'Reason Code': 'ShuntingReasonCode',
  'Remarks': 'Remarks',
  'Shunt In Location': 'ShuntInLocation',
  'Shunt Out Location': 'ShuntOutLocation',
  'Class Of Stores': 'ClassOfStores',
  'NHM': 'NHM',
  'UN Code': 'UNCode',
  'DG Class': 'DGClass',
  'Contains Hazardous Goods': 'ContainsHazardousGoods',
  'Wagon Seal No.': 'WagonSealNo',
  'Container Seal No.': 'ContainerSealNo',
  'Shunt In Date & Time': 'ShuntInDate', // Doubt
  'Shunt Out Date & Time': 'ShuntOutDate', // Doubt
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
    fieldName: 'Tare Weight',
    displayName: 'Tare Weight',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Gross Weight',
    displayName: 'Gross Weight',
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
    fieldName: 'Commodity ID',
    displayName: 'Commodity ID',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Commodity Actual Qty',
    displayName: 'Commodity Actual Qty',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
    }
  },
  {
    fieldName: 'Commodity Qty UOM',
    displayName: 'Commodity Qty UOM',
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
    fieldName: 'Wagon length',
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
    fieldName: 'Commodity Damaged Qty',
    displayName: 'Commodity Damaged Qty',
    validationRules: {
      type: 'number',
      required: false,
      min: 0
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
    fieldName: 'Commodity Description',
    displayName: 'Commodity Description',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 255
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
    fieldName: 'Reason Code',
    displayName: 'Reason Code',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 50
    }
  },
  {
    fieldName: 'Remarks',
    displayName: 'Remarks',
    validationRules: {
      type: 'string',
      required: false,
      maxLength: 500
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
    fieldName: 'Shunt In Date & Time',
    displayName: 'Shunt In Date & Time',
    validationRules: {
      type: 'date',
      required: false
    }
  },
  {
    fieldName: 'Shunt Out Date & Time',
    displayName: 'Shunt Out Date & Time',
    validationRules: {
      type: 'date',
      required: false
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