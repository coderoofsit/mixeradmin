import React, { useState } from 'react';
import { XCircle, CheckCircle, Shield, FileSearch, AlertCircle, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

interface Person {
  reportToken: string;
  name: string;
  dateOfBirth: string;
  age: number | null;
  address: string;
  phone: string;
  email: string;
  score: number;
  gender: string;
  deceased: string;
  details: {
    names: Array<{
      firstName: string;
      lastName: string;
      middleName: string;
      fullName: string;
      firstDate: string;
      lastDate: string;
    }>;
    addresses: Array<{
      fullAddress: string;
      line1: string;
      line2: string;
      city: string;
      state: string;
      zip: string;
      county: string;
      subdivisionName: string;
      firstDate: string;
      lastDate: string;
    }>;
    phoneNumbers: Array<{
      phoneNumber: string;
      phoneType: string;
      carrier: string;
      city: string;
      state: string;
      county: string;
      timeZone: string;
      firstDate: string;
      lastDate: string;
    }>;
    emailAddresses: Array<{
      emailAddress: string;
    }>;
    professionalLicenses: Array<{
      licenseType: string;
      licenseNumber: string;
      licenseState: string;
      licenseStatus: string;
      issueDate: string;
      expirationDate: string;
    }>;
    relationships: Array<{
      relationshipType: string;
      name: string;
      currentAge: string;
      deceasedRecord?: any;
    }>;
    civilRecords: {
      bankruptcies: string;
      liens: string;
      judgments: string;
      mostRecentBankruptcy?: any;
      mostRecentLien?: any;
      mostRecentJudgment?: any;
    };
    criminalRecords: Array<{
      caseNumber: string;
      state: string;
      offense: string;
      classification: string;
      arrestDate: string;
      disposition: string;
      dispositionDate: string;
      court: string;
      arrestingAgency: string;
      county: string;
      status: string;
      conviction: string;
      chargesFiledDate: string;
      warrantDate: string;
      offenseCode: string;
      offenseDescription2: string;
    }>;
    driversLicenses: Array<{
      driversLicenseNumber: string;
      issuingState: string;
      issueDate: string;
      expirationDate: string;
      licenseType: string;
      restrictions: string;
      endorsements: string;
    }>;
    voterRegistrations: Array<{
      party: string;
      registrationDate: string;
      address: string;
    }>;
    watchListRecords: Array<{
      fullName: string;
      score: string;
      source: string;
      type: string;
      offense: string;
      wantedBy: string;
      program: string;
    }>;
    possibleSexOffender: boolean;
    firstDate: string;
    lastDate: string;
  };
}

interface PersonSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    people: Person[];
    checkId: string;
    source: 'local_database' | 'searchbug_api';
    message: string;
    requiresSelection?: boolean;
  };
  onPersonSelected?: (selectedPerson: Person) => void;
  onCheckBackground?: (reportToken: string, checkId: string) => void;
  backgroundCheckLoading?: boolean;
}

const PersonSelectionModal: React.FC<PersonSelectionModalProps> = ({
  isOpen,
  onClose,
  data,
  onPersonSelected,
  onCheckBackground,
  backgroundCheckLoading = false
}) => {
  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleSelectPerson = async (personIndex: number) => {
    if (!data.checkId) return;

    try {
      setIsSelecting(true);
      
      const response = await adminApi.selectPersonFromSearchResults({
        checkId: data.checkId,
        selectedPersonIndex: personIndex
      });
      
      if (response.data.success) {
        toast.success('Person selected and saved to database successfully');
        if (onPersonSelected) {
          onPersonSelected(response.data.data.selectedPerson);
        }
        onClose();
      } else {
        const errorMessage = response.data.message || 'Failed to select person';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error selecting person:', error);
      
      // Enhanced error handling with specific error messages
      let errorMessage = 'Failed to select person';
      let errorType = 'error';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverError = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            errorMessage = serverError || 'Invalid selection. The person data may be corrupted.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            errorType = 'warning';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to select this person.';
            break;
          case 404:
            errorMessage = 'Person not found or selection expired. Please search again.';
            break;
          case 409:
            errorMessage = 'This person has already been selected. Please refresh the page.';
            break;
          case 422:
            errorMessage = 'Invalid person data. Please try selecting a different person.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment before trying again.';
            errorType = 'warning';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = serverError || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error - no response received
        errorMessage = 'Network error. Please check your internet connection and try again.';
        errorType = 'warning';
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      // Show appropriate toast based on error type
      if (errorType === 'warning') {
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.error(errorMessage, { duration: 8000 });
      }
      
      // Log detailed error for debugging
      console.error('Detailed selection error info:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        personIndex,
        checkId: data.checkId
      });
      
      // Store error for retry mechanism
      setSelectionError(errorMessage);
      
    } finally {
      setIsSelecting(false);
    }
  };

  // Retry function for failed person selection
  const handleRetrySelection = async (personIndex: number) => {
    if (retryCount >= 3) {
      toast.error('Maximum retry attempts reached. Please try again later.');
      return;
    }
    
    setRetryCount(prev => prev + 1);
    setSelectionError(null);
    await handleSelectPerson(personIndex);
  };

  const getSourceInfo = () => {
    if (data.source === 'local_database') {
      return {
        icon: <Shield className="h-5 w-5 text-green-600" />,
        title: 'Locally Saved Record',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-900'
      };
    } else {
      return {
        icon: <FileSearch className="h-5 w-5 text-blue-600" />,
        title: 'SearchBug API Results',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900'
      };
    }
  };

  const sourceInfo = getSourceInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {data.requiresSelection ? 'Select Correct Person' : 'Search Results'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {data.requiresSelection 
                  ? 'Multiple people found. Please select the correct match.' 
                  : 'Review the person details below.'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-auto max-h-[calc(95vh-120px)]">
          {/* Source Information */}
          {/* <div className={`mb-6 p-4 ${sourceInfo.bgColor} border ${sourceInfo.borderColor} rounded-lg`}>
            <div className="flex items-center">
              {sourceInfo.icon}
              <div className="ml-3">
                <div className={`text-base font-semibold ${sourceInfo.textColor}`}>
                  {sourceInfo.title}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {data.message}
                </div>
              </div>
            </div>
          </div> */}

          {/* Selection Interface */}
          {data.requiresSelection ? (
            <div className="space-y-6">
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                  Found {data.people.length} people. Please select the correct one:
                </h4>
                <p className="text-sm text-yellow-700">
                  Click "Select This Person" to save the record to the database.
                </p>
              </div>
              
              {data.people.map((person, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors bg-white shadow-sm">
                  <PersonCard person={person} />
                  
                  {/* Error display for this person */}
                  {selectionError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-800 font-medium">Selection Failed</p>
                          <p className="text-sm text-red-700 mt-1">{selectionError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      onClick={() => handleSelectPerson(index)}
                      disabled={isSelecting}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {isSelecting ? 'Saving to Database...' : 'Select This Person'}
                    </button>
                    
                    {/* Retry button - only show if there was an error and retry count is less than 3 */}
                    {selectionError && retryCount < 3 && (
                      <button
                        onClick={() => handleRetrySelection(index)}
                        disabled={isSelecting}
                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                      >
                        <RefreshCw className="h-5 w-5" />
                        Retry ({retryCount}/3)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Regular Search Results */
            <div className="space-y-6">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  Found {data.people.length} potential matches:
                </h4>
                <p className="text-sm text-blue-700">
                  Review the person details and generate background report if needed.
                </p>
              </div>
              
              {data.people.map((person, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                  <PersonCard person={person} />
                  {onCheckBackground && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => onCheckBackground(person.reportToken, data.checkId)}
                        disabled={backgroundCheckLoading}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                      >
                        <FileSearch className="h-5 w-5" />
                        {backgroundCheckLoading ? 'Generating Report...' : 'Check Background'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Person Card Component
const PersonCard: React.FC<{ person: Person }> = ({ person }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="bg-white">
      {/* Primary Information Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div>
          <h5 className="font-semibold text-gray-900 text-xl">{person.name}</h5>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">Score: {person.score}%</span>
            </div>
            {person.age && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Age: {person.age}</span>
              </div>
            )}
            {/* Criminal Records Status */}
            <div className="flex items-center gap-1">
              {person.details.criminalRecords && person.details.criminalRecords.length > 0 ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Criminal Records: {person.details.criminalRecords.length}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Clean Criminal Record</span>
                </>
              )}
            </div>
            {/* Civil Records Status */}
            <div className="flex items-center gap-1">
              {person.details.civilRecords && 
               (person.details.civilRecords.bankruptcies !== "0" || 
                person.details.civilRecords.liens !== "0" || 
                person.details.civilRecords.judgments !== "0") ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-600 font-medium">Civil Records Found</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Clean Civil Record</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Primary Contact</div>
          <div className="text-sm font-medium text-gray-900">{person.phone}</div>
        </div>
      </div>

      {/* Primary Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Address</div>
          </div>
          <div className="text-sm font-medium text-gray-900">{person.address}</div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</div>
          </div>
          <div className="text-sm font-medium text-gray-900">{person.phone}</div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</div>
          </div>
          <div className="text-sm font-medium text-gray-900">{person.email}</div>
        </div>
      </div>

      {/* Expandable Details */}
      {person.details && (
        <div className="space-y-4">
          {person.details.names && person.details.names.length > 0 && (
            <ExpandableSection
              title="Names"
              items={person.details.names}
              isExpanded={expandedSections.has('names')}
              onToggle={() => toggleSection('names')}
            />
          )}
          
          {person.details.addresses && person.details.addresses.length > 0 && (
            <ExpandableSection
              title="Addresses"
              items={person.details.addresses}
              isExpanded={expandedSections.has('addresses')}
              onToggle={() => toggleSection('addresses')}
            />
          )}
          
          {person.details.phoneNumbers && person.details.phoneNumbers.length > 0 && (
            <ExpandableSection
              title="Phone Numbers"
              items={person.details.phoneNumbers}
              isExpanded={expandedSections.has('phones')}
              onToggle={() => toggleSection('phones')}
            />
          )}
          
          {person.details.emailAddresses && person.details.emailAddresses.length > 0 && (
            <ExpandableSection
              title="Email Addresses"
              items={person.details.emailAddresses}
              isExpanded={expandedSections.has('emails')}
              onToggle={() => toggleSection('emails')}
            />
          )}

          {person.details.relationships && person.details.relationships.length > 0 && (
            <ExpandableSection
              title="Relationships"
              items={person.details.relationships}
              isExpanded={expandedSections.has('relationships')}
              onToggle={() => toggleSection('relationships')}
            />
          )}

          {/* Criminal Records */}
          <ExpandableSection
            title="Criminal Records"
            items={person.details.criminalRecords && person.details.criminalRecords.length > 0 ? person.details.criminalRecords : [{ status: 'clean' }]}
            isExpanded={expandedSections.has('criminal')}
            onToggle={() => toggleSection('criminal')}
            isCriminal={true}
          />

          {/* Civil Records */}
          <ExpandableSection
            title="Civil Records"
            items={[
              {
                bankruptcies: person.details.civilRecords?.bankruptcies || "0",
                liens: person.details.civilRecords?.liens || "0",
                judgments: person.details.civilRecords?.judgments || "0"
              }
            ]}
            isExpanded={expandedSections.has('civil')}
            onToggle={() => toggleSection('civil')}
          />

          {/* Professional Licenses */}
          {/* {person.details.professionalLicenses && person.details.professionalLicenses.length > 0 && (
            <ExpandableSection
              title="Professional Licenses"
              items={person.details.professionalLicenses}
              isExpanded={expandedSections.has('licenses')}
              onToggle={() => toggleSection('licenses')}
            />
          )} */}

          {/* Drivers Licenses */}
          {/* {person.details.driversLicenses && person.details.driversLicenses.length > 0 && (
            <ExpandableSection
              title="Drivers Licenses"
              items={person.details.driversLicenses}
              isExpanded={expandedSections.has('drivers')}
              onToggle={() => toggleSection('drivers')}
            />
          )} */}

          {/* Voter Registrations */}
          {/* {person.details.voterRegistrations && person.details.voterRegistrations.length > 0 && (
            <ExpandableSection
              title="Voter Registrations"
              items={person.details.voterRegistrations}
              isExpanded={expandedSections.has('voter')}
              onToggle={() => toggleSection('voter')}
            />
          )} */}

          {/* Watch List Records */}
          {/* {person.details.watchListRecords && person.details.watchListRecords.length > 0 && (
            <ExpandableSection
              title="Watch List Records"
              items={person.details.watchListRecords}
              isExpanded={expandedSections.has('watchlist')}
              onToggle={() => toggleSection('watchlist')}
              isCriminal={true}
            />
          )} */}
        </div>
      )}
    </div>
  );
};

// Expandable Section Component
const ExpandableSection: React.FC<{
  title: string;
  items: any[];
  isExpanded: boolean;
  onToggle: () => void;
  isCriminal?: boolean;
}> = ({ title, items, isExpanded, onToggle, isCriminal = false }) => {
  const renderItemContent = (item: any, index: number) => {
    switch (title) {
      case 'Names':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {item.fullName || `${item.firstName} ${item.middleName} ${item.lastName}`.trim()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {item.firstDate && item.lastDate && (
                    <span>Active: {item.firstDate} - {item.lastDate}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {item.firstName && item.lastName && (
                  <div className="text-right">
                    <div>First: {item.firstName}</div>
                    {item.middleName && <div>Middle: {item.middleName}</div>}
                    <div>Last: {item.lastName}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'Addresses':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {item.fullAddress || `${item.line1} ${item.line2} ${item.city}, ${item.state} ${item.zip}`.trim()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {item.city && item.state && (
                    <span>{item.city}, {item.state} {item.zip}</span>
                  )}
                  {item.county && (
                    <span className="ml-2 text-gray-500">({item.county} County)</span>
                  )}
                </div>
                {item.subdivisionName && (
                  <div className="text-xs text-gray-500 mt-1">
                    Subdivision: {item.subdivisionName}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 ml-4">
                {item.firstDate && item.lastDate && (
                  <div className="text-right">
                    <div>From: {item.firstDate}</div>
                    <div>To: {item.lastDate}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'Phone Numbers':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {item.phoneNumber}
                </div>
                <div className="text-sm text-gray-600">
                  {item.phoneType && <span>Type: {item.phoneType}</span>}
                  {item.carrier && <span className="ml-2">Carrier: {item.carrier}</span>}
                </div>
                {item.city && item.state && (
                  <div className="text-xs text-gray-500">
                    Location: {item.city}, {item.state}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {item.firstDate && item.lastDate && (
                  <div className="text-right">
                    <div>From: {item.firstDate}</div>
                    <div>To: {item.lastDate}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'Email Addresses':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="font-medium text-gray-900">
                {item.emailAddress}
              </div>
            </div>
          </div>
        );
      
      case 'Relationships':
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {item.name?.fullName || 'Unknown'}
                </div>
                <div className="text-sm text-gray-600">
                  {item.relationshipType && <span>Relationship: {item.relationshipType}</span>}
                </div>
                {item.DOB && (
                  <div className="text-xs text-gray-500">
                    DOB: {item.DOB} {item.currentAge && `(Age: ${item.currentAge})`}
                  </div>
                )}
              </div>
              {item.reportToken && (
                <div className="text-xs text-blue-500">
                  Report Token: {item.reportToken}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'Criminal Records':
        if (item.status === 'clean') {
          return (
            <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div className="font-medium text-green-800">Clean - No Criminal Records Found</div>
              </div>
            </div>
          );
        }
        return (
          <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-red-800">{item.offense}</div>
                <div className="text-xs text-red-600">{item.state}</div>
              </div>
              <div className="text-sm text-red-700">
                <div>Case: {item.caseNumber}</div>
                <div>Classification: {item.classification}</div>
                {item.arrestDate !== "No" && <div>Arrest Date: {item.arrestDate}</div>}
                {item.disposition !== "No" && <div>Disposition: {item.disposition}</div>}
                {item.court !== "No" && <div>Court: {item.court}</div>}
              </div>
            </div>
          </div>
        );

      case 'Civil Records':
        const hasRecords = item.bankruptcies !== "0" || item.liens !== "0" || item.judgments !== "0";
        if (!hasRecords) {
          return (
            <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div className="font-medium text-green-800">Clean - No Civil Records Found</div>
              </div>
            </div>
          );
        }
        return (
          <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="space-y-1">
              <div className="font-medium text-yellow-800">Civil Records Found:</div>
              <div className="text-sm text-yellow-700">
                <div>Bankruptcies: {item.bankruptcies}</div>
                <div>Liens: {item.liens}</div>
                <div>Judgments: {item.judgments}</div>
              </div>
            </div>
          </div>
        );

      case 'Professional Licenses':
        return (
          <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-1">
              <div className="font-medium text-blue-800">{item.licenseType}</div>
              <div className="text-sm text-blue-700">
                <div>License #: {item.licenseNumber}</div>
                <div>State: {item.licenseState}</div>
                <div>Status: {item.licenseStatus}</div>
                {item.issueDate !== "No" && <div>Issue Date: {item.issueDate}</div>}
                {item.expirationDate !== "No" && <div>Expiration: {item.expirationDate}</div>}
              </div>
            </div>
          </div>
        );

      case 'Drivers Licenses':
        return (
          <div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="space-y-1">
              <div className="font-medium text-indigo-800">License #{item.driversLicenseNumber}</div>
              <div className="text-sm text-indigo-700">
                <div>State: {item.issuingState}</div>
                <div>Type: {item.licenseType}</div>
                {item.issueDate !== "No" && <div>Issue Date: {item.issueDate}</div>}
                {item.expirationDate !== "No" && <div>Expiration: {item.expirationDate}</div>}
                {item.restrictions !== "No" && <div>Restrictions: {item.restrictions}</div>}
                {item.endorsements !== "No" && <div>Endorsements: {item.endorsements}</div>}
              </div>
            </div>
          </div>
        );

      case 'Voter Registrations':
        return (
          <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="space-y-1">
              <div className="font-medium text-purple-800">Party: {item.party}</div>
              <div className="text-sm text-purple-700">
                <div>Registration Date: {item.registrationDate}</div>
                <div>Address: {item.address}</div>
              </div>
            </div>
          </div>
        );

      case 'Watch List Records':
        return (
          <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="space-y-1">
              <div className="font-medium text-red-800">{item.fullName}</div>
              <div className="text-sm text-red-700">
                <div>Type: {item.type}</div>
                <div>Offense: {item.offense}</div>
                <div>Source: {item.source}</div>
                {item.wantedBy !== "No" && <div>Wanted By: {item.wantedBy}</div>}
                {item.program !== "No" && <div>Program: {item.program}</div>}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(item, null, 2)}</pre>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
      >
        <span className="font-medium text-gray-900">{title} ({items.length})</span>
        <span className="text-gray-500 text-lg">{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
          {items.map((item, index) => renderItemContent(item, index))}
        </div>
      )}
    </div>
  );
};

export default PersonSelectionModal;
