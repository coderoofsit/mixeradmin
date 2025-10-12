/**
 * Maps gender values for display in admin panel
 * Database stores Male, Female, Other Gender - display as received
 * Backward compatibility: "transgender" maps to "Other Gender"
 */
export const mapGenderForDisplay = (gender: string | null | undefined): string => {
  if (!gender) return 'N/A';
  
  // Backward compatibility: map old "transgender" to "Other Gender"
  if (gender.toLowerCase() === 'transgender') {
    return 'Other Gender';
  }
  
  // Database stores proper case: Male, Female, Other Gender
  return gender;
};

/**
 * Maps gender values for filtering (used in dropdowns)
 * Database stores Male, Female, Other Gender - use exact values
 */
export const getGenderFilterOptions = () => [
  // { value: 'all', label: 'All' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other Gender', label: 'Other Gender' }
];

/**
 * Maps filter value back to database value
 * Database stores Male, Female, Other Gender - return as is
 */
export const mapFilterToDatabaseGender = (filterValue: string): string | undefined => {
  if (filterValue === 'all') return undefined;
  // Database stores Male, Female, Other Gender - return exact value
  return filterValue;
};

/**
 * Maps interestedIn values for display in admin panel
 * Database stores Male, Female, Non-binary - display as received
 * Backward compatibility: "transgender" maps to "Non-binary"
 */
export const mapInterestedInForDisplay = (interestedIn: string[] | null | undefined): string[] => {
  if (!interestedIn || !Array.isArray(interestedIn)) return [];
  
  // Backward compatibility: map old "transgender" to "Non-binary"
  return interestedIn.map(item => {
    if (item.toLowerCase() === 'transgender') {
      return 'Non-binary';
    }
    return item;
  });
};
