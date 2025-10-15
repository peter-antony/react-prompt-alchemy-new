import { create } from 'zustand';

export interface ActualsData {
  // Wagon Details
  wagonType?: string;
  wagonId?: string;
  wagonQuantity?: string;
  wagonQuantityUnit?: string;
  wagonTareWeight?: string;
  wagonTareWeightUnit?: string;
  wagonGrossWeight?: string;
  wagonGrossWeightUnit?: string;
  wagonLength?: string;
  wagonLengthUnit?: string;
  wagonSequence?: string;

  // Container Details
  containerType?: string;
  containerId?: string;
  containerQuantity?: string;
  containerQuantityUnit?: string;
  containerTareWeight?: string;
  containerTareWeightUnit?: string;
  containerLoadWeight?: string;
  containerLoadWeightUnit?: string;

  // Product Details
  hazardousGoods?: boolean;
  nhm?: string;
  productId?: string;
  productQuantity?: string;
  productQuantityUnit?: string;
  classOfStores?: string;
  unCode?: string;
  dgClass?: string;

  // THU Details
  thuId?: string;
  thuQuantity?: string;
  thuQuantityUnit?: string;
  thuGrossWeight?: string;
  thuGrossWeightUnit?: string;
  thuTareWeight?: string;
  thuTareWeightUnit?: string;
  thuNetWeight?: string;
  thuNetWeightUnit?: string;
  thuLength?: string;
  thuLengthUnit?: string;
  thuWidth?: string;
  thuWidthUnit?: string;
  thuHeight?: string;
  thuHeightUnit?: string;

  // Journey Details
  departure?: string;
  destination?: string;
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;

  // Other Details
  qcUserdefined1?: string;
  qcUserdefined2?: string;
  qcUserdefined3?: string;
  remarks1?: string;
  remarks2?: string;
  remarks3?: string;
}

export interface PlannedData {
  // Wagon Details
  wagonType?: string;
  wagonId?: string;
  wagonQuantity?: string;
  wagonTareWeight?: string;
  wagonGrossWeight?: string;
  wagonLength?: string;
  wagonSequence?: string;

  // Container Details
  containerType?: string;
  containerId?: string;
  containerQuantity?: string;
  containerTareWeight?: string;
  containerLoadWeight?: string;

  // Product Details
  hazardousGoods?: string;
  nhm?: string;
  productId?: string;
  productQuantity?: string;
  classOfStores?: string;
  unCode?: string;
  dgClass?: string;

  // THU Details
  thuId?: string;
  thuQuantity?: string;
  thuGrossWeight?: string;
  thuTareWeight?: string;
  thuNetWeight?: string;
  thuLength?: string;
  thuWidth?: string;
  thuHeight?: string;

  // Journey Details
  departure?: string;
  destination?: string;
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;

  // Other Details
  qcUserdefined1?: string;
  qcUserdefined2?: string;
  qcUserdefined3?: string;
  remarks1?: string;
  remarks2?: string;
  remarks3?: string;
}

export interface WagonItemData {
  id: string;
  planned: PlannedData;
  actuals: ActualsData;
}

interface PlanActualStore {
  wagonItems: Record<string, WagonItemData>;
  activeWagonId: string | null;
  setActiveWagon: (id: string) => void;
  updatePlannedData: (wagonId: string, data: Partial<PlannedData>) => void;
  updateActualsData: (wagonId: string, data: Partial<ActualsData>) => void;
  getWagonData: (wagonId: string) => WagonItemData | null;
  initializeWagon: (wagonId: string) => void;
}

const createDefaultWagonData = (id: string): WagonItemData => ({
  id,
  planned: {},
  actuals: {},
});

export const usePlanActualStore = create<PlanActualStore>((set, get) => ({
  wagonItems: {
    'WAG00000001': createDefaultWagonData('WAG00000001'),
    'WAG00000002': createDefaultWagonData('WAG00000002'),
    'WAG00000003': createDefaultWagonData('WAG00000003'),
    'WAG00000004': createDefaultWagonData('WAG00000004'),
  },
  activeWagonId: 'WAG00000001',

  setActiveWagon: (id) =>
    set({ activeWagonId: id }),

  initializeWagon: (wagonId) =>
    set((state) => ({
      wagonItems: {
        ...state.wagonItems,
        [wagonId]: state.wagonItems[wagonId] || createDefaultWagonData(wagonId),
      },
    })),

  updatePlannedData: (wagonId, data) =>
    set((state) => ({
      wagonItems: {
        ...state.wagonItems,
        [wagonId]: {
          ...state.wagonItems[wagonId],
          planned: {
            ...state.wagonItems[wagonId]?.planned,
            ...data,
          },
        },
      },
    })),

  updateActualsData: (wagonId, data) =>
    set((state) => ({
      wagonItems: {
        ...state.wagonItems,
        [wagonId]: {
          ...state.wagonItems[wagonId],
          actuals: {
            ...state.wagonItems[wagonId]?.actuals,
            ...data,
          },
        },
      },
    })),

  getWagonData: (wagonId) => {
    const state = get();
    return state.wagonItems[wagonId] || null;
  },
}));
