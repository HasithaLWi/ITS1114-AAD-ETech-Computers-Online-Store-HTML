// ============================================================
//  policy-data.js — Store Business Profile & Legal Policies Model
// ============================================================
import {
  DEFAULT_BUSINESS_INFO,
  DEFAULT_LEGAL_POLICIES,
  legalPolicies
} from '../../data/policies.js';

export { DEFAULT_BUSINESS_INFO, DEFAULT_LEGAL_POLICIES, legalPolicies };

const POLICIES_STORAGE_KEY = 'etech_policies';
const BUSINESS_INFO_STORAGE_KEY = 'etech_business_info';

/**
 * Retrieve business info from localStorage (or fallback to defaults)
 */
export function getBusinessInfo() {
  const data = localStorage.getItem(BUSINESS_INFO_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(BUSINESS_INFO_STORAGE_KEY, JSON.stringify(DEFAULT_BUSINESS_INFO));
    return DEFAULT_BUSINESS_INFO;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_BUSINESS_INFO;
  }
}

/**
 * Save business info to localStorage
 */
export function saveBusinessInfo(info) {
  localStorage.setItem(BUSINESS_INFO_STORAGE_KEY, JSON.stringify(info));
  return { success: true, message: 'Business profile updated successfully!' };
}

/**
 * Retrieve all legal policies from localStorage (or fallback to defaults)
 */
export function getStoredPolicies() {
  const data = localStorage.getItem(POLICIES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(DEFAULT_LEGAL_POLICIES));
    return DEFAULT_LEGAL_POLICIES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_LEGAL_POLICIES;
  }
}

/**
 * Save all policies to localStorage
 */
export function saveStoredPolicies(policies) {
  localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(policies));
}

/**
 * Get specific policy by key ('privacy' | 'terms' | 'warranty')
 */
export function getPolicyData(key) {
  const policies = getStoredPolicies();
  return policies[key] || policies.privacy;
}

/**
 * Update single policy document
 */
export function updatePolicyDocument(key, policyData) {
  const policies = getStoredPolicies();
  policies[key] = {
    ...policies[key],
    ...policyData,
    id: key
  };
  saveStoredPolicies(policies);
  return { success: true, message: `${policyData.title || key} updated successfully!` };
}
