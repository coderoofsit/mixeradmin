/**
 * Maps gender values for display in admin panel
 * Transgender is displayed as "Other" in the admin UI
 */
export const mapGenderForDisplay = (gender: string | null | undefined): string => {
  if (!gender) return 'N/A';
  
  const normalizedGender = gender.toLowerCase().trim();
  
  switch (normalizedGender) {
    case 'transgender':
      return 'Other';
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    default:
      return gender.charAt(0).toUpperCase() + gender.slice(1);
  }
};

/**
 * Maps gender values for filtering (used in dropdowns)
 * Transgender is shown as "Other" in filter options
 */
export const getGenderFilterOptions = () => [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'transgender', label: 'Other' }
];

/**
 * Maps filter value back to database value
 * "Other" filter maps to "transgender" in database
 */
export const mapFilterToDatabaseGender = (filterValue: string): string | undefined => {
  if (filterValue === 'all') return undefined;
  if (filterValue === 'transgender') return 'transgender';
  return filterValue;
};

/**
 * Maps interestedIn values for display in admin panel
 * "Transgender" is displayed as "Other" in the admin UI
 */
export const mapInterestedInForDisplay = (interestedIn: string[] | null | undefined): string[] => {
  if (!interestedIn || !Array.isArray(interestedIn)) return [];
  
  return interestedIn.map(item => {
    const normalizedItem = item.toLowerCase().trim();
    switch (normalizedItem) {
      case 'transgender':
        return 'Other';
      case 'man':
        return 'Man';
      case 'woman':
        return 'Woman';
      default:
        return item.charAt(0).toUpperCase() + item.slice(1);
    }
  });
};
