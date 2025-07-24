let jsonData: any = null;

function setJsonData(data: any) {
  jsonData = data;
}

function getJsonData() {
  return jsonData;
}

function getQuickOrder() {
  if (jsonData && jsonData.ResponseResult) {
    return jsonData.ResponseResult.QuickOrder;
  }
  return undefined;
}

function setQuickOrder(data: any) {
  if (jsonData && jsonData.ResponseResult) {
    jsonData.ResponseResult.QuickOrder = data;
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
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    return jsonData.ResponseResult.QuickOrder.ResourceGroup[0].Attachments;
  }
  return undefined;
}

function setAttachments(attachments: any) {
  if (
    jsonData &&
    jsonData.ResponseResult &&
    jsonData.ResponseResult.QuickOrder &&
    Array.isArray(jsonData.ResponseResult.QuickOrder.ResourceGroup) &&
    jsonData.ResponseResult.QuickOrder.ResourceGroup.length > 0
  ) {
    jsonData.ResponseResult.QuickOrder.ResourceGroup[0].Attachments = attachments;
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
  getPlanDetails,
  setPlanDetails,
  getActualDetails,
  setActualDetails,
  getResourceGroupCount,
  pushPlanDetails,
  pushActualDetails,
  getAllPlanDetails,
  getAllActualDetails
};

export default jsonStore; 