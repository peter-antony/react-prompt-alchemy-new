import { create } from 'zustand';

interface TripInfo {
  TripID: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  DepartureActualDate: string;
  ArrivalActualDate: string;
  LoadType: string;
  TripStatus: string;
  DraftBillNo: string | null;
  DraftBillStatus: string | null;
  DraftBillWarning: string | null;
  SupplierID: string;
  SupplierDescription: string;
}

interface LegDetail {
  LegSequence: number;
  LegID: string;
  LegUniqueId: string;
  Departure: string;
  DepartureDescription: string;
  Arrival: string;
  ArrivalDescription: string;
  LegBehaviour: string;
  LegBehaviourDescription: string;
  TransportMode: string;
  LegStatus: string | null;
  TripInfo: TripInfo[] | null;
  ModeFlag: string;
  ReasonForUpdate: string | null;
  QCCode1: string | null;
  QCCode1Value: string | null;
  Remarks: string | null;
}

interface TransportRoute {
  ExecutionPlanID: string;
  CustomerOrderID: string;
  CustomerID: string;
  CustomerName: string;
  Service: string;
  ServiceDescription: string;
  SubService: string;
  SubServiceDescription: string;
  CODeparture: string;
  CODepartureDescription: string;
  COArrival: string;
  COArrivalDescription: string;
  RouteID: string;
  RouteDescription: string;
  Status: string;
  LegDetails: LegDetail[];
  ReasonForUpdate: string;
}

interface TransportRouteStore {
  routes: TransportRoute[];
  selectedOrder: TransportRoute | null;
  selectedRoute: TransportRoute | null;
  isDrawerOpen: boolean;
  isRouteDrawerOpen: boolean;
  highlightedIndexes: number[];
  fetchRoutes: () => void;
  handleCustomerOrderClick: (order: TransportRoute) => void;
  openRouteDrawer: (route: TransportRoute) => Promise<void>;
  closeDrawer: () => void;
  closeRouteDrawer: () => void;
  highlightRowIndexes: (indexes: number[]) => void;
  addLegPanel: () => void;
  removeLegPanel: (index: number) => void;
  updateLegData: (index: number, field: string, value: any) => void;
  saveRouteDetails: () => Promise<void>;
  fetchDepartures: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
  fetchArrivals: (params: { searchTerm: string; offset: number; limit: number }) => Promise<{ label: string; value: string }[]>;
}

// Mock data
const mockRoutes: TransportRoute[] = [
  {
        "ExecutionPlanID": "EXE/2021/00005668",
        "CustomerOrderID": "BR/2025/0259",
        "CustomerID": "1005",
        "CustomerName": "ramcotest",
        "Service": "BT",
        "ServiceDescription": "BLOCK TRAIN CONVENTIONAL",
        "SubService": "WOW",
        "SubServiceDescription": "WITHOUT  EQUIPMENT / SOC",
        "CODeparture": "10-00001",
        "CODepartureDescription": "10-00001",
        "COArrival": "10-00004",
        "COArrivalDescription": "10-00004",
        "RouteID": "ROUTE 78",
        "RouteDescription": "ROUTE 78",
        "Status": "PLND",
        // "LoadType": "Loaded",
        "LegDetails": [
            {
                "LegSequence": 1,
                "LegID": "Leg 1",
                "LegUniqueId": "BDAE29DB-15BD-4804-8CBD-E53771EBFC41",
                "Departure": "10-00001",
                "DepartureDescription": "North Chennai",
                "Arrival": "10-00002",
                "ArrivalDescription": "East Chennai",
                "LegBehaviour": "Pick",
                "LegBehaviourDescription": "Pick",
                "TransportMode": "Rail",
                "LegStatus": "CF",
                "TripInfo": [
                    {
                        "TripID": "TP/2021/00024972",
                        "Departure": "10-00001",
                        "DepartureDescription": "North Chennai",
                        "Arrival": "10-00002",
                        "ArrivalDescription": "East Chennai",
                        "DepartureActualDate": null,
                        "ArrivalActualDate": null,
                        "LoadType": "Loaded",
                        "TripStatus": "Released",
                        "DraftBillNo": null,
                        "DraftBillStatus": null,
                        "DraftBillWarning": null,
                        "SupplierID": "10020296",
                        "SupplierDescription": "ZIMMERMANN SPEDITION GMBH"
                    }
                ],
                "ModeFlag": "Nochange",
                "ReasonForUpdate": null,
                "QCCode1": null,
                "QCCode1Value": null,
                "Remarks": null
            },
            {
                "LegSequence": 2,
                "LegID": "Leg 2",
                "LegUniqueId": "C53AE354-E8A9-48F9-9590-6B56C5D6EDB9",
                "Departure": "10-00002",
                "DepartureDescription": "East Chennai",
                "Arrival": "10-00003",
                "ArrivalDescription": "West Chennai",
                "LegBehaviour": "LHV",
                "LegBehaviourDescription": "LHV",
                "TransportMode": "Rail",
                "LegStatus": "AC",
                "TripInfo": null,
                "ModeFlag": "Nochange",
                "ReasonForUpdate": null,
                "QCCode1": null,
                "QCCode1Value": null,
                "Remarks": null
            },
            {
                "LegSequence": 3,
                "LegID": "Leg 3",
                "LegUniqueId": "DA84BAF0-A11C-471F-9A36-47F372686A06",
                "Departure": "10-00003",
                "DepartureDescription": "West Chennai",
                "Arrival": "10-00004",
                "ArrivalDescription": "10-00004",
                "LegBehaviour": "Dvry",
                "LegBehaviourDescription": "Dvry",
                "TransportMode": "Rail",
                "LegStatus": null,
                "TripInfo": null,
                "ModeFlag": "Nochange",
                "ReasonForUpdate": null,
                "QCCode1": null,
                "QCCode1Value": null,
                "Remarks": null
            }
        ],
        "ReasonForUpdate": ""
    },
  {
    ExecutionPlanID: "EXE/2021/00002762",
    CustomerOrderID: "BR/2021/00009246",
    CustomerID: "10026537",
    CustomerName: "Transport Solutions Ltd",
    Service: "MT",
    ServiceDescription: "MULTI CONTAINER TRANSPORT",
    SubService: "WW",
    SubServiceDescription: "WITH WAGON",
    CODeparture: "27-706709",
    CODepartureDescription: "Berlin ( 27-706709- )",
    COArrival: "21-130505",
    COArrivalDescription: "Poland ( 21-130505- )",
    RouteID: "YP_Route10",
    RouteDescription: "YP_Route10",
    Status: "PRTDLV",
    LegDetails: [],
    ReasonForUpdate: ""
  },
];

export const useTransportRouteStore = create<TransportRouteStore>((set, get) => ({
  routes: [],
  selectedOrder: null,
  selectedRoute: null,
  isDrawerOpen: false,
  isRouteDrawerOpen: false,
  highlightedIndexes: [],

  fetchRoutes: () => {
    // Simulate API call
    set({ routes: mockRoutes });
  },

  handleCustomerOrderClick: (order: TransportRoute) => {
    set({ selectedOrder: order, isDrawerOpen: true });
  },

  openRouteDrawer: async (route: TransportRoute) => {
    // Simulate API call - in real scenario, fetch from backend
    set({ selectedRoute: route, isRouteDrawerOpen: true });
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false, selectedOrder: null });
  },

  closeRouteDrawer: () => {
    set({ isRouteDrawerOpen: false, selectedRoute: null });
  },

  highlightRowIndexes: (indexes: number[]) => {
    set({ highlightedIndexes: indexes });
  },

  addLegPanel: () => {
    const { selectedRoute } = get();
    if (!selectedRoute) return;

    const newLeg: LegDetail = {
      LegSequence: (selectedRoute.LegDetails?.length || 0) + 1,
      LegID: '',
      LegUniqueId: crypto.randomUUID(),
      Departure: '',
      DepartureDescription: '',
      Arrival: '',
      ArrivalDescription: '',
      LegBehaviour: 'Pick',
      LegBehaviourDescription: 'Pick',
      TransportMode: 'Rail',
      LegStatus: null,
      TripInfo: null,
      ModeFlag: 'Nochange',
      ReasonForUpdate: null,
      QCCode1: null,
      QCCode1Value: null,
      Remarks: null
    };

    set({
      selectedRoute: {
        ...selectedRoute,
        LegDetails: [...selectedRoute.LegDetails, newLeg]
      }
    });
  },

  removeLegPanel: (index: number) => {
    const { selectedRoute } = get();
    if (!selectedRoute) return;

    const updatedLegs = selectedRoute.LegDetails.filter((_, i) => i !== index);
    set({
      selectedRoute: {
        ...selectedRoute,
        LegDetails: updatedLegs
      }
    });
  },

  updateLegData: (index: number, field: string, value: any) => {
    const { selectedRoute } = get();
    if (!selectedRoute) return;

    const updatedLegs = [...selectedRoute.LegDetails];
    updatedLegs[index] = {
      ...updatedLegs[index],
      [field]: value
    };

    set({
      selectedRoute: {
        ...selectedRoute,
        LegDetails: updatedLegs
      }
    });
  },

  saveRouteDetails: async () => {
    const { selectedRoute } = get();
    if (!selectedRoute) return;

    // Simulate API call
    console.log('Saving route details:', selectedRoute);
    
    // Update the route in the routes array
    const { routes } = get();
    const updatedRoutes = routes.map(route => 
      route.ExecutionPlanID === selectedRoute.ExecutionPlanID ? selectedRoute : route
    );

    set({ routes: updatedRoutes });
  },

  fetchDepartures: async ({ searchTerm, offset, limit }) => {
    // Simulate API call
    const mockDepartures = [
      { label: 'Assa ( 27-706709- )', value: '27-706709' },
      { label: 'Berlin ( 27-706709- )', value: '27-706709' },
      { label: 'Ossinki ( 20-RU- )', value: '20-RU' },
      { label: 'Brest-Zevernui Eks ( 21-130505- )', value: '21-130505' },
      { label: 'Hamburg-Waltershof ( 80-136- )', value: '80-000136' },
      { label: 'Dresden ( 80-000136- )', value: '80-000136' }
    ];

    return mockDepartures.filter(o => 
      o.label.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(offset, offset + limit);
  },

  fetchArrivals: async ({ searchTerm, offset, limit }) => {
    // Simulate API call
    const mockArrivals = [
      { label: 'Ossinki ( 20-RU- )', value: '20-RU' },
      { label: 'Brest-Zevernui Eks ( 21-130505- )', value: '21-130505' },
      { label: 'Hamburg-Waltershof ( 80-136- )', value: '80-000136' },
      { label: 'Hürth-Kalscheuren ( 80-15480-7 )', value: '80-154807' },
      { label: 'Poland ( 21-130505- )', value: '21-130505' },
      { label: 'Czech Republic', value: 'czech_republic' }
    ];

    return mockArrivals.filter(d => 
      d.label.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(offset, offset + limit);
  }
}));