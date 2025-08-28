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
  console.log("getQuickOrder called",jsonData);
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

function setQuickOrderFields(fields: {ContractID?:any, Customer?: any, Vendor?: any, Cluster?: any, WBS?: any }) {
  if (jsonData && jsonData.ResponseResult && jsonData.ResponseResult.QuickOrder) {
    const quickOrder = jsonData.ResponseResult.QuickOrder;
    if (fields.ContractID !== undefined) quickOrder.Contract = fields.ContractID;
    if (fields.Customer !== undefined) quickOrder.Customer = fields.Customer;
    if (fields.Vendor !== undefined) quickOrder.Vendor = fields.Vendor;
    if (fields.Cluster !== undefined) quickOrder.Cluster = fields.Cluster;
    if (fields.WBS !== undefined) quickOrder.WBS = fields.WBS;
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
      alert("IF.. ")
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
    if (found && found.OperationalDetails) {
      return found.OperationalDetails;
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

function pushPlanDetailsToResourceGroup(resourceUniqueID: string, planDetailsJsonData: any) {
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
};

export default jsonStore;