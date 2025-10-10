/**
 * Maps gender values for display in admin panel
 * Database stores Male, Female, Other - display as received
 */
export const mapGenderForDisplay = (gender: string | null | undefined): string => {
  if (!gender) return 'N/A';
  
  // Database already stores proper case: Male, Female, Other
  return gender;
};

/**
 * Maps gender values for filtering (used in dropdowns)
 * Database stores Male, Female, Other - use exact values
 */
export const getGenderFilterOptions = () => [
  { value: 'all', label: 'All' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

/**
 * Maps filter value back to database value
 * Database stores Male, Female, Other - return as is
 */
export const mapFilterToDatabaseGender = (filterValue: string): string | undefined => {
  if (filterValue === 'all') return undefined;
  // Database stores Male, Female, Other - return exact value
  return filterValue;
};

/**
 * Maps interestedIn values for display in admin panel
 * Database stores Male, Female, Other - display as received
 */
export const mapInterestedInForDisplay = (interestedIn: string[] | null | undefined): string[] => {
  if (!interestedIn || !Array.isArray(interestedIn)) return [];
  
  // Database already stores proper case: Male, Female, Other
  return interestedIn;
};
