let jsonData: any = null;
let resourceJsonData: any = null;
let planDetailsJsonData: any = null;
let actualDetailsJsonData:any = null;
function setJsonData(data: any) {
  jsonData = data;
}

function getJsonData() {
  return jsonData;
}
function setResourceJsonData(data: any) {
  resourceJsonData = data;
}
function getResourceJsonData() {
  return resourceJsonData;
}
function setPlanDetailsJson(data: any) {
  planDetailsJsonData = data;
}
function getPlanDetailsJson() {
  return planDetailsJsonData;
}
function setActualDetailsJson(data: any) {
  actualDetailsJsonData = data;
}
function getActualDetailsJson() {
  return actualDetailsJsonData;
}
function getQuickOrder() {
  // console.log("getQuickOrder called",jsonData);
  if (jsonData && jsonData.ResponseResult) {
    return jsonData.ResponseResult.QuickOrder;
  }
  return undefined;
}

function setQuickOrder(data: any) {
  if (jsonData && jsonData.ResponseResult) {
    const oldQuickOrder = jsonData.ResponseResult.QuickOrder || {};
    jsonData.ResponseResult.QuickOrder = { ...oldQuickOrder, ...data };
    return true;
  }
  return false;
}

function setQuickOrderFields(fields: {OrderType?:any,Contract?:any, ContractDescription?: any, Customer?: any, Vendor?: any, VendorName?: any, Cluster?: any, ClusterLocationDesc?: any, WBS?: any,Currency?:any,QuickOrderDate?:any, Summary?:any,Remark1?: any,Remarks2?:any,Remarks3?:any,QCUserDefined1?: any,QCUserDefined2?:any,QCUserDefined3?:any, }) {
  if (jsonData && jsonData.ResponseResult && jsonData.ResponseResult.QuickOrder) {
    const quickOrder = jsonData.ResponseResult.QuickOrder;
    console.log("quickOrder111111111", quickOrder);
    if (fields.Contract !== undefined) quickOrder.Contract = fields.Contract;
    if (fields.ContractDescription !== undefined) quickOrder.ContractDesc = fields.ContractDescription;
    if (fields.Customer !== undefined) quickOrder.Customer = fields.Customer;
    if (fields.QuickOrderDate !== undefined) quickOrder.QuickOrderDate = fields.QuickOrderDate;
    if (fields.Currency !== undefined) quickOrder.Currency = fields.Currency;
    if (fields.Vendor !== undefined) quickOrder.Vendor = fields.Vendor;
    if (fields.VendorName !== undefined) quickOrder.VendorName = fields.VendorName;
    if (fields.Cluster !== undefined) quickOrder.Cluster = fields.Cluster;
    if (fields.ClusterLocationDesc !== undefined) quickOrder.ClusterLocationDesc = fields.ClusterLocationDesc;
    if (fields.WBS !== undefined) quickOrder.WBS = fields.WBS;
    if (fields.OrderType !== undefined) quickOrder.OrderType = fields.OrderType;
    if (fields.Summary !== undefined) quickOrder.Summary = fields.Summary;
    if (fields.Remark1 !== undefined) quickOrder.Remark1 = fields.Remark1;
    if (fields.Remarks2 !== undefined) quickOrder.Remarks2 = fields.Remarks2;
    if (fields.Remarks3 !== undefined) quickOrder.Remarks3 = fields.Remarks3;
    if (fields.QCUserDefined1 !== undefined) quickOrder.QCUserDefined1 = fields.QCUserDefined1;
    if (fields.QCUserDefined2 !== undefined) quickOrder.QCUserDefined2 = fields.QCUserDefined2;
    if (fields.QCUserDefined3 !== undefined) quickOrder.QCUserDefined3 = fields.QCUserDefined3;
    return true;
  }
  return false;
}

function getResourceGroup() {
  if (jsonData && jsonData.ResponseResult && jsonData.ResponseResult.QuickOrder) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup;
  }
  return undefined;
}

function setResourceGroup(resourceGroup: any) {
  if (jsonData && jsonData.ResponseResult && jsonData.ResponseResult.QuickOrder) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup = resourceGroup;
    return true;
  }
  return false;
}

function getBasicDetails() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup[0].BasicDetails;
  }
  return undefined;
}

function setBasicDetails(basicDetails: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup[0].BasicDetails = basicDetails;
    return true;
  }
  return false;
}

function getOperationalDetails() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup[0].OperationalDetails;
  }
  return undefined;
}

function setOperationalDetails(operationalDetails: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup[0].OperationalDetails = operationalDetails;
    return true;
  }
  return false;
}

function getBillingDetails() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup[0].BillingDetails;
  }
  return undefined;
}

function setBillingDetails(billingDetails: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup[0].BillingDetails = billingDetails;
    return true;
  }
  return false;
}

function getMoreRefDocs() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup[0].MoreRefDocs;
  }
  return undefined;
}

function setMoreRefDocs(moreRefDocs: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup[0].MoreRefDocs = moreRefDocs;
    return true;
  }
  return false;
}

function getAttachments() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    jsonData.ResponseResult.QuickOrder.Attachments
  ) {
    return jsonData.ResponseResult.QuickOrder.Attachments.AttachItems;
  }
  return undefined;
}

function setAttachments(attachments: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    jsonData.ResponseResult.QuickOrder.Attachments
  ) {
    jsonData.ResponseResult.QuickOrder.Attachments = attachments;
    return true;
  }
  return false;
}

function pushAttachments(attachments: any) {
  if (
    resourceJsonData &&
    resourceJsonData.Attachments
  ) {
    if (!Array.isArray(resourceJsonData.Attachments.AttachItems)) {
      resourceJsonData.Attachments.AttachItems = [];
    }
    resourceJsonData.Attachments.AttachItems.push(attachments);
    resourceJsonData.Attachments.TotalAttachment = resourceJsonData.Attachments.AttachItems.length;
    return true;
  }
  return false;
}

function getResourceGroupAttachments() {
  if (
    resourceJsonData &&
    resourceJsonData.Attachments
  ) {
    return resourceJsonData.Attachments.AttachItems;
  }
  return undefined;
}

function setResourceGroupAttachments(attachments: any) {
  if (
    resourceJsonData &&
    resourceJsonData.Attachments
  ) {
    resourceJsonData.Attachments = attachments;
    return true;
  }
  return false;
}

function pushResourceGroupAttachments(attachments: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.Attachments
  ) {
    if (!Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup.Attachments.AttachItems)) {
      jsonData.ResponseResult.QuickOrder.ResourceGroup.Attachments.AttachItems = [];
    }
    jsonData.ResponseResult.QuickOrder.ResourceGroup.Attachments.AttachItems.push(attachments);
    jsonData.ResponseResult.QuickOrder.ResourceGroup.Attachments.TotalAttachment = jsonData.ResponseResult.QuickOrder.ResourceGroup.Attachments.AttachItems.length;
    return true;
  }
  return false;
}

function getPlanDetails() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup[0].PlanDetails;
  }
  return undefined;
}

function setPlanDetails(planDetails: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup[0].PlanDetails = planDetails;
    return true;
  }
  return false;
}

function getActualDetails() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup[0].ActualDetails;
  }
  return undefined;
}

function setActualDetails(actualDetails: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup[0].ActualDetails = actualDetails;
    return true;
  }
  return false;
}

function getResourceGroupCount() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup.length;
  }
  return 0;
}

function pushPlanDetails(planDetail: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    const rg = jsonData.ResponseResult.QuickOrder.ResourceGroup[0];
    if (!Array.isArray(rg.PlanDetails)) {
      rg.PlanDetails = [];
    }
    rg.PlanDetails.push(planDetail);
    return true;
  }
  return false;
}

function pushActualDetails(actualDetail: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    const rg = jsonData.ResponseResult.QuickOrder.ResourceGroup[0];
    if (!Array.isArray(rg.ActualDetails)) {
      rg.ActualDetails = [];
    }
    rg.ActualDetails.push(actualDetail);
    return true;
  }
  return false;
}

function getAllPlanDetails() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    const rg = jsonData.ResponseResult.QuickOrder.ResourceGroup[0];
    return Array.isArray(rg.PlanDetails) ? rg.PlanDetails : [];
  }
  return [];
}

function getAllActualDetails() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    const rg = jsonData.ResponseResult.QuickOrder.ResourceGroup[0];
    return Array.isArray(rg.ActualDetails) ? rg.ActualDetails : [];
  }
  return [];
}

function getAllResourceGroups() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup;
  }
  return [];
}

function setResourceStatusByUniqueID(resourceUniqueID: string, newStatus: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const idx = groupArr.findIndex(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (idx !== -1) {
      groupArr[idx].ResourceStatus = newStatus;
      return true;
    }
  }
  return false;
}

function updateResourceGroupByUniqueID(resourceUniqueID: string, updatedFields: Record<string, any>) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const idx = groupArr.findIndex(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (idx !== -1) {
      // Only update the fields provided in updatedFields
      Object.assign(groupArr[idx], updatedFields);
      return true;
    }
  }
  return false;
}

function setResourceBasicDetails(basicDetails: any) {
  if (
    resourceJsonData &&
    typeof resourceJsonData === 'object'
  ) {
    resourceJsonData.BasicDetails = {
      ...(resourceJsonData.BasicDetails || {}),
      ...basicDetails
    };
    console.log("RRRRR = ",getResourceJsonData())
    return true;
  }
  return false;
}

function setResourceOperationalDetails(operationalDetails: any) {
  if (
    resourceJsonData &&
    typeof resourceJsonData === 'object'
  ) {
    resourceJsonData.OperationalDetails = {
      ...(resourceJsonData.OperationalDetails || {}),
      ...operationalDetails
    };
    return true;
  }
  return false;
}

function setResourceBillingDetails(billingDetails: any) {
  if (
    resourceJsonData &&
    typeof resourceJsonData === 'object'
  ) {
    resourceJsonData.BillingDetails = {
      ...(resourceJsonData.BillingDetails || {}),
      ...billingDetails
    };
    return true;
  }
  return false;
}
function setResourceMoreInfoDetails(moreInfo: any) {
  if (
    resourceJsonData &&
    typeof resourceJsonData === 'object'
  ) {
    resourceJsonData.MoreRefDocs = {
      ...(resourceJsonData.MoreRefDocs || {}),
      ...moreInfo
    };
    return true;
  }
  return false;
}

function pushResourceGroup(resourceGroupObj: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder
  ) {
    if (!Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)) {
      jsonData.ResponseResult.QuickOrder.ResourceGroup = [];
    }
    jsonData.ResponseResult.QuickOrder.ResourceGroup.push(resourceGroupObj);
    return true;
  }
  return false;
}

function updateResourceGroupDetailsByUniqueID(resourceUniqueID: string, basicDetails: any, operationalDetails: any, billingDetails: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const idx = groupArr.findIndex(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (idx !== -1) {
      // Only update the fields provided, persist others
      groupArr[idx].BasicDetails = {
        ...(groupArr[idx].BasicDetails || {}),
        ...basicDetails
      };
      groupArr[idx].OperationalDetails = {
        ...(groupArr[idx].OperationalDetails || {}),
        ...operationalDetails
      };
      groupArr[idx].BillingDetails = {
        ...(groupArr[idx].BillingDetails || {}),
        ...billingDetails
      };
      return true;
    }
  }
  return false;
}

function getOperationalDetailsByResourceUniqueID(resourceUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const found = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (found && found.OperationalDetails) {
      return found.OperationalDetails;
    }
  }
  return undefined;
}

function getMoreInfoDetailsByResourceUniqueID(resourceUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const found = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    console.log("found --------------", found);
    if (found && found.MoreRefDocs) {
      return found.MoreRefDocs;
    }
  }
  return undefined;
}

function getBillingDetailsByResourceUniqueID(resourceUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const found = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (found && found.BillingDetails) {
      return found.BillingDetails;
    }
  }
  return undefined;
}

function getBasicDetailsByResourceUniqueID(resourceUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const found = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (found && found.BasicDetails) {
      return found.BasicDetails;
    }
  }
  return undefined;
}

function pushPlanDetailsToResourceGroup(resourceUniqueID: any, planDetailsJsonData: any) {
  console.log("PARAM DATA : ",planDetailsJsonData,"PARAM ID ",resourceUniqueID)
  console.log("JSON DATA : ",jsonData.ResponseResult.QuickOrder )
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const idx = groupArr.findIndex(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (idx !== -1) {
      if (!Array.isArray(groupArr[idx].PlanDetails)) {
        groupArr[idx].PlanDetails = [];
      }
      groupArr[idx].PlanDetails.push(planDetailsJsonData);
      return true;
    }
  }
  return false;
}

function pushActualDetailsToResourceGroup(resourceUniqueID: string, actualDetailsJsonData: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const idx = groupArr.findIndex(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (idx !== -1) {
      if (!Array.isArray(groupArr[idx].ActualDetails)) {
        groupArr[idx].ActualDetails = [];
      }
      groupArr[idx].ActualDetails.push(actualDetailsJsonData);
      return true;
    }
  }
  return false;
}

function getAllPlanDetailsByResourceUniqueID(resourceUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const found = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (found && Array.isArray(found.PlanDetails)) {
      return found.PlanDetails;
    }
  }
  return [];
}

function getAllActualDetailsByResourceUniqueID(resourceUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const found = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    if (found && Array.isArray(found.ActualDetails)) {
      return found.ActualDetails;
    }
  }
  return [];
}

function getQuickUniqueID() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    typeof jsonData.ResponseResult.QuickOrder.QuickUniqueID !== 'undefined'
  ) {
    return jsonData.ResponseResult.QuickOrder.QuickUniqueID;
  }
  return undefined;
}

function getQuickOrderNo() {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    typeof jsonData.ResponseResult.QuickOrder.QuickOrderNo !== 'undefined'
  ) {
    return jsonData.ResponseResult.QuickOrder.QuickOrderNo;
  }
  return undefined;
}

function pushQuickOrderAttachment(attachment: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    jsonData.ResponseResult.QuickOrder.Attachments
  ) {
    if (!Array.isArray(jsonData.ResponseResult.QuickOrder.Attachments[0].AttachItems)) {
      jsonData.ResponseResult.QuickOrder.Attachments[0].AttachItems = [];
    }
    jsonData.ResponseResult.QuickOrder.Attachments[0].AttachItems.push(attachment);
    jsonData.ResponseResult.QuickOrder.Attachments[0].TotalAttachment =
      jsonData.ResponseResult.QuickOrder.Attachments[0].AttachItems.length.toString();
    return true;
  }
  return false;
}

function setResourceGroupFields(fields: { ServiceType?: any, OperationalLocation?: any }) {
  if (resourceJsonData) {
    if (fields.ServiceType !== undefined) {
      if (!resourceJsonData.BasicDetails) resourceJsonData.BasicDetails = {};
      resourceJsonData.BasicDetails.ServiceType = fields.ServiceType;
    }
    if (fields.OperationalLocation !== undefined) {
      if (!resourceJsonData.OperationalDetails) resourceJsonData.OperationalDetails = {};
      resourceJsonData.OperationalDetails.OperationalLocation = fields.OperationalLocation;
    }
    return true;
  }
  return false;
}

function setResourceType(fields: { Resource?: any, ResourceDescription?: any, ResourceType?: any, ResourceTypeDescription?: any }) {
  if (resourceJsonData) {
    if (!resourceJsonData.BasicDetails) resourceJsonData.BasicDetails = {};
    if (fields.Resource !== undefined) resourceJsonData.BasicDetails.Resource = fields.Resource;
    if (fields.ResourceDescription !== undefined) resourceJsonData.BasicDetails.ResourceDescription = fields.ResourceDescription;
    if (fields.ResourceType !== undefined) resourceJsonData.BasicDetails.ResourceType = fields.ResourceType;
    if (fields.ResourceTypeDescription !== undefined) resourceJsonData.BasicDetails.ResourceTypeDescription = fields.ResourceTypeDescription;
    return true;
  }
  return false;
}

function setTariffFields(fields: { tariff?: any, tariffDescription?: any, contractPrice?: any, unitPrice?: any, netAmount?: any, tariffType?: any, billToID?: any}) {
  console.log("resourceJsonData === ^^^^", resourceJsonData)
  if (resourceJsonData) {
    if (!resourceJsonData.BillingDetails) {
      resourceJsonData.BillingDetails = {};
    }
    if (fields.tariff !== undefined) resourceJsonData.BillingDetails.Tariff = fields.tariff;
    if (fields.tariffDescription !== undefined) resourceJsonData.BillingDetails.TariffIDDescription = fields.tariffDescription;
    if(fields.unitPrice !== undefined) resourceJsonData.BillingDetails.UnitPrice = fields.contractPrice;
    if (fields.contractPrice !== undefined) resourceJsonData.BillingDetails.ContractPrice = fields.contractPrice;
    if (fields.netAmount !== undefined) resourceJsonData.BillingDetails.NetAmount = fields.netAmount;
    if (fields.tariffType !== undefined) resourceJsonData.BillingDetails.TariffType = fields.tariffType;
    if (fields.billToID !== undefined) resourceJsonData.BillingDetails.BillToID = fields.billToID;
    return true;
  }
  return false;
}
function setTariffDateFields(fields: { fromDate?: any, toDate?: any}) {
  console.log("resourceJsonData === ^^^^", resourceJsonData)
  if (resourceJsonData) {
    if (!resourceJsonData.OperationalDetails) {
      resourceJsonData.OperationalDetails = {};
    }
    if (fields.fromDate !== undefined) resourceJsonData.OperationalDetails.FromDate = fields.fromDate;
    if (fields.toDate !== undefined) resourceJsonData.OperationalDetails.ToDate = fields.toDate;
    return true;
  }
  return false;
}

function getResourceGroupBasicDetails() {
  if (resourceJsonData && resourceJsonData.BasicDetails) {
    return resourceJsonData.BasicDetails;
  }
  return undefined;
}

function getResourceGroupOperationalDetails() {
  if (resourceJsonData && resourceJsonData.OperationalDetails) {
    return resourceJsonData.OperationalDetails;
  }
  return undefined;
}

function getResourceGroupMoreRefDocs() {
  if (resourceJsonData && resourceJsonData.MoreRefDocs) {
    return resourceJsonData.MoreRefDocs;
  }
  return undefined;
}

function getResourceGroupBillingDetails() {
  if (resourceJsonData && resourceJsonData.BillingDetails) {
    return resourceJsonData.BillingDetails;
  }
  return undefined;
}

// ContractTariffList storage
let contractTariffList: any[] = [];

function setContractTariffList(list: any[]) {
  contractTariffList = Array.isArray(list) ? list : [];
}

function getContractTariffList() {
  return contractTariffList;
}

function setResourceMoreRefDocs(moreRefDocs: any) {
  if (
    resourceJsonData &&
    typeof resourceJsonData === 'object'
  ) {
    resourceJsonData.MoreRefDocs = moreRefDocs;
    return true;
  }
  return false;
}

function updatePlanDetailsByResourceAndPlanLineID(resourceUniqueID: string, planLineUniqueID: string, updatedFields: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const resourceGroup = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    
    if (resourceGroup && Array.isArray(resourceGroup.PlanDetails)) {
      const planDetails = resourceGroup.PlanDetails;
      const planIndex = planDetails.findIndex(
        (plan: any) => plan.PlanLineUniqueID === planLineUniqueID
      );
      
      if (planIndex !== -1) {
        // Update only the provided fields, preserve others
        planDetails[planIndex] = {
          ...planDetails[planIndex],
          ...updatedFields
        };
        return true;
      }
    }
  }
  return false;
}

function updateActualDetailsByResourceAndPlanLineID(resourceUniqueID: string, ActualLineUniqueID: string, updatedFields: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const resourceGroup = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    
    if (resourceGroup && Array.isArray(resourceGroup.ActualDetails)) {
      const actualDetails = resourceGroup.ActualDetails;
      const planIndex = actualDetails.findIndex(
        (plan: any) => plan.ActualLineUniqueID === ActualLineUniqueID
      );
      
      if (planIndex !== -1) {
        // Update only the provided fields, preserve others
        actualDetails[planIndex] = {
          ...actualDetails[planIndex],
          ...updatedFields
        };
        return true;
      }
    }
  }
  return false;
}

function getPlanDetailsByResourceAndPlanLineID(resourceUniqueID: string, planLineUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const resourceGroup = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    
    if (resourceGroup && Array.isArray(resourceGroup.PlanDetails)) {
      const planDetails = resourceGroup.PlanDetails;
      const foundPlan = planDetails.find(
        (plan: any) => plan.PlanLineUniqueID === planLineUniqueID
      );
      
      return foundPlan;
    }
  }
  return undefined;
}

function getActualDetailsByResourceAndActualLineID(resourceUniqueID: string, actualLineUniqueID: string) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup)
  ) {
    const groupArr = jsonData.ResponseResult.QuickOrder.ResourceGroup;
    const resourceGroup = groupArr.find(
      (item: any) => item.ResourceUniqueID === resourceUniqueID
    );
    
    if (resourceGroup && Array.isArray(resourceGroup.ActualDetails)) {
      const actualDetails = resourceGroup.ActualDetails;
      const foundActual = actualDetails.find(
        (actual: any) => actual.ActualLineUniqueID === actualLineUniqueID
      );
      
      return foundActual;
    }
  }
  return undefined;
}

// Add to export
const jsonStore = {
  setJsonData,
  getJsonData,
  getQuickOrder,
  setQuickOrder,
  getResourceGroup,
  setResourceGroup,
  getBasicDetails,
  setBasicDetails,
  getOperationalDetails,
  setOperationalDetails,
  getBillingDetails,
  setBillingDetails,
  getMoreRefDocs,
  setMoreRefDocs,
  getAttachments,
  setAttachments,
  pushAttachments,
  getResourceGroupAttachments,
  setResourceGroupAttachments,
  pushResourceGroupAttachments,
  getPlanDetails,
  setPlanDetails,
  getActualDetails,
  setActualDetails,
  getResourceGroupCount,
  pushPlanDetails,
  pushActualDetails,
  getAllPlanDetails,
  getAllActualDetails,
  getAllResourceGroups,
  setResourceStatusByUniqueID,
  updateResourceGroupByUniqueID,
  setResourceJsonData,
  getResourceJsonData,
  setResourceBasicDetails,
  setResourceOperationalDetails,
  setResourceBillingDetails,
  setResourceMoreInfoDetails,
  pushResourceGroup,
  updateResourceGroupDetailsByUniqueID,
  getOperationalDetailsByResourceUniqueID,
  getMoreInfoDetailsByResourceUniqueID,
  getBillingDetailsByResourceUniqueID,
  getBasicDetailsByResourceUniqueID,
  setPlanDetailsJson,
  getPlanDetailsJson,
  pushPlanDetailsToResourceGroup,
  setActualDetailsJson,
  getActualDetailsJson,
  pushActualDetailsToResourceGroup,
  getAllPlanDetailsByResourceUniqueID,
  getAllActualDetailsByResourceUniqueID,
  setQuickOrderFields,
  getQuickUniqueID,
  getQuickOrderNo,
  pushQuickOrderAttachment,
  setResourceGroupFields,
  setResourceType,
  setTariffFields,
  setTariffDateFields,
  getResourceGroupBasicDetails,
  getResourceGroupOperationalDetails,
  getResourceGroupMoreRefDocs,
  getResourceGroupBillingDetails,
  setResourceMoreRefDocs,
  setContractTariffList,
  getContractTariffList,
  updatePlanDetailsByResourceAndPlanLineID,
  updateActualDetailsByResourceAndPlanLineID,
  getPlanDetailsByResourceAndPlanLineID,
  getActualDetailsByResourceAndActualLineID,
};

export default jsonStore;