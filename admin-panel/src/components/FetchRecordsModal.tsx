import React, { useState } from 'react';
import { XCircle, CheckCircle, Shield, FileSearch, AlertCircle, User, MapPin, Phone, Mail, Calendar, Users } from 'lucide-react';

interface Person {
  fullName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  possibleRelatives: string[];
  criminalRecords: any[];
  professionalLicenses: any[];
  aliases: string[];
  lastUpdated: string;
  rawData?: {
    names?: {
      name?: Array<{
        firstName: string;
        middleName?: string;
        lastName: string;
        firstDate: string;
        lastDate: string;
      }>;
    };
    phones?: {
      phone?: Array<{
        phoneNumber: string;
        phoneType: string;
        carrier: string;
        firstDate: { day: string; month: string; year: string };
        lastDate: { day: string; month: string; year: string };
      }>;
    };
    emailRecords?: {
      emailRecord?: Array<{
        email: { emailAddress: string };
      }>;
    };
    addresses?: {
      address?: Array<{
        fullStreet: string;
        city: string;
        state: string;
        zip: string;
        county: string;
        firstDate: string;
        lastDate: string;
      }>;
    };
    relationships?: {
      relationship?: Array<{
        relationshipType: string;
        name: {
          firstName: string;
          lastName: string;
        };
        DOB: string;
        currentAge: string;
      }>;
    };
    civilRecords?: {
      numberOfBankruptcies?: string | null;
      numberOfLiens?: string | null;
      numberOfJudgments?: string | null;
    };
  };
}

interface FetchRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    people: Person[];
    checkId: string | null;
    source: 'searchbug_api' | 'db_existing';
    requiresSelection: boolean;
    message: string;
  };
  onPersonSelected?: (selectedPerson: Person, selectedIndex: number) => void;
  onSelectPerson?: (checkId: string, selectedPersonIndex: number) => void;
  isSelecting?: boolean;
}

const FetchRecordsModal: React.FC<FetchRecordsModalProps> = ({
  isOpen,
  onClose,
  data,
  onPersonSelected,
  onSelectPerson,
  isSelecting = false
}) => {
  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number | null>(null);

  const handleSelectPerson = async (personIndex: number) => {
    if (!data.checkId) return;

    try {
      if (onSelectPerson) {
        await onSelectPerson(data.checkId, personIndex);
      }
      
      if (onPersonSelected) {
        onPersonSelected(data.people[personIndex], personIndex);
      }
      
      onClose();
    } catch (error) {
      console.error('Error selecting person:', error);
    }
  };

  const getSourceInfo = () => {
    if (!data) {
      return {
        icon: <FileSearch className="h-5 w-5 text-gray-600" />,
        title: 'Loading...',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-900'
      };
    }
    
    if (data.source === 'db_existing') {
      return {
        icon: <Shield className="h-5 w-5 text-green-600" />,
        title: 'Existing Database Record',
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
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {data?.requiresSelection ? 'Select Correct Person' : 'Person Records Found'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {data?.requiresSelection 
                  ? 'Multiple people found. Please select the correct match.' 
                  : data?.message || 'Review the person details below.'
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
          {/* {data && (
            <div className={`mb-6 p-4 ${sourceInfo.bgColor} border ${sourceInfo.borderColor} rounded-lg`}>
              <div className="flex items-center">
                {sourceInfo.icon}
                <div className="ml-3">
                  <div className={`text-base font-semibold ${sourceInfo.textColor}`}>
                    {sourceInfo.title}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {data.message || 'SearchBug API Results'}
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Loading State */}
          {/* {!data && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Loading Records...</h4>
              <p className="text-gray-600">
                Fetching person records from SearchBug.
              </p>
            </div>
          )} */}

          {/* No Records Found */}
          {data && data.people && data.people.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">No Records Found</h4>
              <p className="text-gray-600">
                {data.message || 'No person records were found for this user in SearchBug.'}
              </p>
            </div>
          )}

          {/* Records List */}
          {data?.people && data.people.length > 0 && (
            <div className="space-y-6">
              {data.requiresSelection && (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                    Found {data.people.length} people. Please select the correct one:
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Click "Select This Person" to save the record to the database.
                  </p>
                </div>
              )}
              
              {data.people.map((person, index) => (
                <div key={index} className={`border-2 rounded-xl p-6 transition-colors bg-white shadow-sm ${
                  data.requiresSelection 
                    ? selectedPersonIndex === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                    : 'border-gray-200'
                }`}>
                  <PersonCard person={person} />
                  
                  {/* Selection buttons - show for all cases */}
                  <div className="mt-6 flex justify-center space-x-3">
                    {data?.requiresSelection ? (
                      // Multiple people - show selection interface
                      <>
                        <button
                          onClick={() => setSelectedPersonIndex(index)}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            selectedPersonIndex === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {selectedPersonIndex === index ? 'Selected' : 'Select This Person'}
                        </button>
                        
                        {selectedPersonIndex === index && (
                          <button
                            onClick={() => handleSelectPerson(index)}
                            disabled={isSelecting}
                            className="px-8 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <CheckCircle className="h-5 w-5" />
                            {isSelecting ? 'Saving...' : 'Confirm Selection'}
                          </button>
                        )}
                      </>
                    ) : (
                      // Single person - show direct select button
                      <button
                        onClick={() => handleSelectPerson(index)}
                        disabled={isSelecting}
                        className="px-8 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                        {isSelecting ? 'Saving...' : 'Select This Person'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Expandable Section Component
const ExpandableSection: React.FC<{
  title: string;
  items: any[];
  isExpanded: boolean;
  onToggle: () => void;
  renderItem: (item: any, index: number) => React.ReactNode;
}> = ({ title, items, isExpanded, onToggle, renderItem }) => {
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
          {items.map((item, index) => renderItem(item, index))}
        </div>
      )}
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const formatDateRange = (firstDate: { day: string; month: string; year: string }, lastDate: { day: string; month: string; year: string }) => {
    const formatDateObj = (date: { day: string; month: string; year: string }) => {
      return `${date.month}/${date.day}/${date.year}`;
    };
    return `${formatDateObj(firstDate)} - ${formatDateObj(lastDate)}`;
  };

  return (
    <div className="bg-white">
      {/* Primary Information Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div>
          <h5 className="font-semibold text-gray-900 text-xl">{person.fullName}</h5>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>DOB: {person.dateOfBirth}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Age: {person.age}</span>
            </div>
            {person.gender && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Gender: {person.gender}</span>
              </div>
            )}
            {/* Criminal Records Status */}
            <div className="flex items-center gap-1">
              {person.criminalRecords && person.criminalRecords.length > 0 ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Criminal Records: {person.criminalRecords.length}</span>
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
              {person.rawData?.civilRecords && 
               (person.rawData.civilRecords.numberOfBankruptcies !== null || 
                person.rawData.civilRecords.numberOfLiens !== null || 
                person.rawData.civilRecords.numberOfJudgments !== null) ? (
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
          <div className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(person.lastUpdated)}
          </div>
        </div>
      </div>

      {/* Primary Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Current Address</div>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {person.address.street}<br />
            {person.address.city}, {person.address.state} {person.address.postalCode}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Primary Phone</div>
          </div>
          <div className="text-sm font-medium text-gray-900">{person.phone}</div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Primary Email</div>
          </div>
          <div className="text-sm font-medium text-gray-900">{person.email}</div>
        </div>
      </div>

      {/* Expandable Details Sections */}
      <div className="space-y-4">
        {/* All Names */}
        {person.rawData?.names?.name && person.rawData.names.name.length > 0 && (
          <ExpandableSection
            title="All Names"
            items={person.rawData.names.name}
            isExpanded={expandedSections.has('names')}
            onToggle={() => toggleSection('names')}
            renderItem={(item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.firstName} {item.middleName} {item.lastName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Active: {formatDate(item.firstDate)} - {formatDate(item.lastDate)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        )}

        {/* All Phone Numbers */}
        {person.rawData?.phones?.phone && person.rawData.phones.phone.length > 0 && (
          <ExpandableSection
            title="All Phone Numbers"
            items={person.rawData.phones.phone}
            isExpanded={expandedSections.has('phones')}
            onToggle={() => toggleSection('phones')}
            renderItem={(item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{item.phoneNumber}</div>
                    <div className="text-sm text-gray-600">
                      {item.phoneType} • {item.carrier}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Active: {formatDateRange(item.firstDate, item.lastDate)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        )}

        {/* All Email Addresses */}
        {person.rawData?.emailRecords?.emailRecord && person.rawData.emailRecords.emailRecord.length > 0 && (
          <ExpandableSection
            title="All Email Addresses"
            items={person.rawData.emailRecords.emailRecord}
            isExpanded={expandedSections.has('emails')}
            onToggle={() => toggleSection('emails')}
            renderItem={(item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-medium text-gray-900">{item.email.emailAddress}</div>
              </div>
            )}
          />
        )}

        {/* All Addresses */}
        {person.rawData?.addresses?.address && person.rawData.addresses.address.length > 0 && (
          <ExpandableSection
            title="All Addresses"
            items={person.rawData.addresses.address}
            isExpanded={expandedSections.has('addresses')}
            onToggle={() => toggleSection('addresses')}
            renderItem={(item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.fullStreet}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.city}, {item.state} {item.zip}
                    </div>
                    {item.county && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.county} County
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    <div>From: {formatDate(item.firstDate)}</div>
                    <div>To: {formatDate(item.lastDate)}</div>
                  </div>
                </div>
              </div>
            )}
          />
        )}

        {/* Relationships */}
        {person.rawData?.relationships?.relationship && person.rawData.relationships.relationship.length > 0 && (
          <ExpandableSection
            title="Relationships"
            items={person.rawData.relationships.relationship}
            isExpanded={expandedSections.has('relationships')}
            onToggle={() => toggleSection('relationships')}
            renderItem={(item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.name.firstName} {item.name.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.relationshipType}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      DOB: {formatDate(item.DOB)} (Age: {item.currentAge})
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        )}

        {/* Criminal Records */}
        <ExpandableSection
          title="Criminal Records"
          items={person.criminalRecords && person.criminalRecords.length > 0 ? person.criminalRecords : [{ status: 'clean' }]}
          isExpanded={expandedSections.has('criminal')}
          onToggle={() => toggleSection('criminal')}
          renderItem={(item, index) => {
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
                    <div className="font-medium text-red-800">{item.offense || 'Criminal Record'}</div>
                    <div className="text-xs text-red-600">{item.state || 'Unknown State'}</div>
                  </div>
                  <div className="text-sm text-red-700">
                    {item.caseNumber && <div>Case: {item.caseNumber}</div>}
                    {item.classification && <div>Classification: {item.classification}</div>}
                    {item.arrestDate && <div>Arrest Date: {item.arrestDate}</div>}
                    {item.disposition && <div>Disposition: {item.disposition}</div>}
                    {item.court && <div>Court: {item.court}</div>}
                  </div>
                </div>
              </div>
            );
          }}
        />

        {/* Civil Records */}
        <ExpandableSection
          title="Civil Records"
          items={[person.rawData?.civilRecords || {}]}
          isExpanded={expandedSections.has('civil')}
          onToggle={() => toggleSection('civil')}
          renderItem={(item, index) => {
            const hasRecords = item.numberOfBankruptcies !== null || item.numberOfLiens !== null || item.numberOfJudgments !== null;
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
                    {item.numberOfBankruptcies !== null && <div>Bankruptcies: {item.numberOfBankruptcies}</div>}
                    {item.numberOfLiens !== null && <div>Liens: {item.numberOfLiens}</div>}
                    {item.numberOfJudgments !== null && <div>Judgments: {item.numberOfJudgments}</div>}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default FetchRecordsModal;
