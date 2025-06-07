import React, { useState, useMemo, useEffect } from 'react';
import { Database, Search, Filter, Download, Grid, List, Plus } from 'lucide-react';
import TollCard from '../components/TollCard';
import TollTable from '../components/TollTable';
import FilterPanel from '../components/FilterPanel';
import Modal from '../components/Modal';
import { VIEW_MODES, SORT_FIELDS, SORT_ORDERS } from '../types/toll';
import { toast } from 'react-toastify';

const emptyTollForm = {
  name: '',
  plaza_code: '',
  lat: '',
  lng: '',
  tolls: {
    car: '',
    lcv: '',
    bus: '',
    threeAxle: '',
    fourAxle: '',
    hcmEme: '',
    oversized: ''
  }
};

const TollDataPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(VIEW_MODES.DETAILS);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(SORT_FIELDS.TOLLNAME);
  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.ASC);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minCarRate: '',
    maxCarRate: ''
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedToll, setSelectedToll] = useState(null);
  const [editForm, setEditForm] = useState(emptyTollForm);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyTollForm);
  const [cardsPerPage, setCardsPerPage] = useState(30);
  const [currentCardPage, setCurrentCardPage] = useState(1);

  // Fetch toll data from backend
  useEffect(() => {
    const fetchTollData = async () => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
        const response = await fetch(`${backendUrl}/api/tolls`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch toll data');
        }

        const tollData = await response.json();
        setData(tollData);
        toast.success('Toll data loaded successfully');
      } catch (error) {
        console.error('Error fetching toll data:', error);
        toast.error('Failed to load toll data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTollData();
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(toll => {
      const matchesSearch = toll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          toll.plaza_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCarRate = (!filters.minCarRate || toll.tolls.car >= parseInt(filters.minCarRate)) &&
                            (!filters.maxCarRate || toll.tolls.car <= parseInt(filters.maxCarRate));
      
      return matchesSearch && matchesCarRate;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      // Handle nested properties for vehicle rates
      if (sortField.startsWith('tolls.')) {
        const path = sortField.split('.');
        aValue = a[path[0]][path[1]];
        bValue = b[path[0]][path[1]];
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === SORT_ORDERS.ASC) {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [data, searchTerm, sortField, sortOrder, filters]);

  // Handle edit modal open
  const handleEdit = (toll) => {
    setEditForm({
      _id: toll._id,
      name: toll.name || '',
      plaza_code: toll.plaza_code || '',
      lat: toll.lat || 0,
      lng: toll.lng || 0,
      tolls: {
        car: toll.tolls.car || 0,
        lcv: toll.tolls.lcv || 0,
        bus: toll.tolls.bus || 0,
        threeAxle: toll.tolls.threeAxle || 0,
        fourAxle: toll.tolls.fourAxle || 0,
        hcmEme: toll.tolls.hcmEme || 0,
        oversized: toll.tolls.oversized || 0
      }
    });
    setIsEditModalOpen(true);
  };

  // Handle delete modal open
  const handleDeleteClick = (toll) => {
    setSelectedToll(toll);
    setIsDeleteModalOpen(true);
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editForm._id) {
        throw new Error('No toll ID found');
      }

      const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/tolls/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editForm.name,
          plaza_code: editForm.plaza_code,
          lat: editForm.lat,
          lng: editForm.lng,
          tolls: editForm.tolls
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update toll');
      }

      const updatedToll = await response.json();
      setData(prev => prev.map(toll => toll._id === updatedToll._id ? updatedToll : toll));
      setIsEditModalOpen(false);
      setEditForm(emptyTollForm);
      toast.success('Toll updated successfully');
    } catch (error) {
      console.error('Error updating toll:', error);
      toast.error(error.message || 'Failed to update toll');
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/tolls/${selectedToll._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete toll');
      }

      setData(prev => prev.filter(toll => toll._id !== selectedToll._id));
      setIsDeleteModalOpen(false);
      toast.success('Toll deleted successfully');
    } catch (error) {
      console.error('Error deleting toll:', error);
      toast.error('Failed to delete toll');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Plaza Code', 'Toll Name', 'Latitude', 'Longitude',
      'Car Rate', 'LCV Rate', 'Bus Rate',
      'Three Axle', 'Four Axle', 'HCM EME', 'Oversized'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(toll => [
        toll.plaza_code,
        `"${toll.name}"`,
        toll.lat,
        toll.lng,
        toll.tolls.car,
        toll.tolls.lcv,
        toll.tolls.bus,
        toll.tolls.threeAxle,
        toll.tolls.fourAxle,
        toll.tolls.hcmEme,
        toll.tolls.oversized
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toll-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle add form submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/tolls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: addForm.name,
          plaza_code: addForm.plaza_code,
          lat: addForm.lat,
          lng: addForm.lng,
          tolls: addForm.tolls
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add toll');
      }

      const newToll = await response.json();
      setData(prev => [...prev, newToll]);
      setIsAddModalOpen(false);
      setAddForm(emptyTollForm);
      toast.success('Toll added successfully');
    } catch (error) {
      console.error('Error adding toll:', error);
      toast.error(error.message || 'Failed to add toll');
    }
  };

  // Add this function to handle card pagination
  const handleCardPageChange = (pageNumber) => {
    setCurrentCardPage(pageNumber);
  };

  // Add this function to handle cards per page change
  const handleCardsPerPageChange = (number) => {
    setCardsPerPage(number);
    setCurrentCardPage(1); // Reset to first page when changing items per page
  };

  // Modify the renderCards function
  const renderCards = () => {
    const startIndex = (currentCardPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredAndSortedData.length / cardsPerPage);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedData.map(toll => (
            <TollCard
              key={toll._id}
              toll={toll}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
            <select
              value={cardsPerPage}
              onChange={(e) => handleCardsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">cards per page</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCardPageChange(currentCardPage - 1)}
              disabled={currentCardPage === 1}
              className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentCardPage} of {totalPages}
            </span>
            <button
              onClick={() => handleCardPageChange(currentCardPage + 1)}
              disabled={currentCardPage === totalPages}
              className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} tolls
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Toll Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Toll Data Management</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage {data.length} toll entries across India
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Toll
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search toll name or plaza code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value={SORT_FIELDS.TOLLNAME}>Sort by Name</option>
                  <option value={SORT_FIELDS.PLAZA_CODE}>Sort by Plaza Code</option>
                  <option value={SORT_FIELDS.CAR_RATE}>Sort by Car Rate</option>
                  <option value={SORT_FIELDS.LCV_RATE}>Sort by LCV Rate</option>
                  <option value={SORT_FIELDS.BUS_RATE}>Sort by Bus Rate</option>
                  <option value={SORT_FIELDS.THREE_AXLE_RATE}>Sort by Three Axle Rate</option>
                  <option value={SORT_FIELDS.FOUR_AXLE_RATE}>Sort by Four Axle Rate</option>
                  <option value={SORT_FIELDS.HCM_EME_RATE}>Sort by HCM EME Rate</option>
                  <option value={SORT_FIELDS.OVERSIZED_RATE}>Sort by Oversized Rate</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === SORT_ORDERS.ASC ? SORT_ORDERS.DESC : SORT_ORDERS.ASC)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {sortOrder === SORT_ORDERS.ASC ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setViewMode(VIEW_MODES.DETAILS)}
                  className={`p-2 transition-colors ${
                    viewMode === VIEW_MODES.DETAILS 
                      ? 'bg-red-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode(VIEW_MODES.CARDS)}
                  className={`p-2 transition-colors ${
                    viewMode === VIEW_MODES.CARDS 
                      ? 'bg-red-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title="Card View"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredAndSortedData.length} of {data.length} toll entries
            {viewMode === VIEW_MODES.CARDS && ' (Card View)'}
            {viewMode === VIEW_MODES.DETAILS && ' (Table View)'}
          </p>
        </div>

        {/* Data Display */}
        {viewMode === VIEW_MODES.DETAILS ? (
          <TollTable 
            data={filteredAndSortedData} 
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={(newSortField) => setSortField(newSortField)}
          />
        ) : (
          renderCards()
        )}

        {/* Empty State */}
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No toll data found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="mt-2">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete the toll plaza "{selectedToll?.name}"? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditForm(emptyTollForm);
        }}
        title="Edit Toll"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Toll Name*
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="Enter toll name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plaza Code*
                </label>
                <input
                  type="text"
                  value={editForm.plaza_code}
                  onChange={(e) => setEditForm(prev => ({ ...prev, plaza_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="Enter plaza code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Latitude*
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={editForm.lat}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g. 28.6139"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Longitude*
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={editForm.lng}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g. 77.2090"
                />
              </div>
            </div>
          </div>

          {/* Toll Rates Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="mr-2">Toll Rates</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(in ₹)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Car*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.tolls.car}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, car: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  LCV*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.tolls.lcv}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, lcv: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Bus*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.tolls.bus}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, bus: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  3-Axle*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.tolls.threeAxle}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, threeAxle: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  4-Axle*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.tolls.fourAxle}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, fourAxle: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  HCM/EME*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.tolls.hcmEme}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, hcmEme: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Oversized*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.tolls.oversized}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, oversized: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditForm(emptyTollForm);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Update Toll
            </button>
          </div>
        </form>
      </Modal>

      {/* Add New Toll Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddForm(emptyTollForm);
        }}
        title="Add New Toll"
      >
        <form onSubmit={handleAddSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Toll Name*
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="Enter toll name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plaza Code*
                </label>
                <input
                  type="text"
                  value={addForm.plaza_code}
                  onChange={(e) => setAddForm(prev => ({ ...prev, plaza_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="Enter plaza code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Latitude*
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={addForm.lat}
                  onChange={(e) => setAddForm(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g. 28.6139"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Longitude*
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={addForm.lng}
                  onChange={(e) => setAddForm(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g. 77.2090"
                />
              </div>
            </div>
          </div>

          {/* Toll Rates Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="mr-2">Toll Rates</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(in ₹)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Car*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.tolls.car}
                  onChange={(e) => setAddForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, car: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  LCV*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.tolls.lcv}
                  onChange={(e) => setAddForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, lcv: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Bus*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.tolls.bus}
                  onChange={(e) => setAddForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, bus: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  3-Axle*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.tolls.threeAxle}
                  onChange={(e) => setAddForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, threeAxle: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  4-Axle*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.tolls.fourAxle}
                  onChange={(e) => setAddForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, fourAxle: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  HCM/EME*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.tolls.hcmEme}
                  onChange={(e) => setAddForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, hcmEme: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Oversized*
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.tolls.oversized}
                  onChange={(e) => setAddForm(prev => ({
                    ...prev,
                    tolls: { ...prev.tolls, oversized: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setAddForm(emptyTollForm);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Toll
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TollDataPage;