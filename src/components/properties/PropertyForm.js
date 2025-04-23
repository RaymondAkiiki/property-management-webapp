// src/components/properties/PropertyForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PropertyForm = ({ property, isEditing }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: {
      street: property?.address?.street || '',
      city: property?.address?.city || '',
      state: property?.address?.state || '',
      zipCode: property?.address?.zipCode || '',
      country: property?.address?.country || 'USA'
    },
    type: property?.type || 'apartment',
    owner: {
      name: property?.owner?.name || '',
      email: property?.owner?.email || '',
      phone: property?.owner?.phone || '',
      address: property?.owner?.address || ''
    },
    units: property?.units || [
      {
        unitNumber: '',
        bedrooms: 1,
        bathrooms: 1,
        squareFeet: 0,
        rent: 0,
        isOccupied: false
      }
    ],
    amenities: property?.amenities || [],
    notes: property?.notes || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amenityInput, setAmenityInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleUnitChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedUnits = [...formData.units];
    
    updatedUnits[index] = {
      ...updatedUnits[index],
      [name]: type === 'checkbox' ? checked : value
    };
    
    setFormData({
      ...formData,
      units: updatedUnits
    });
  };

  const addUnit = () => {
    setFormData({
      ...formData,
      units: [
        ...formData.units,
        {
          unitNumber: '',
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 0,
          rent: 0,
          isOccupied: false
        }
      ]
    });
  };

  const removeUnit = (index) => {
    const updatedUnits = [...formData.units];
    updatedUnits.splice(index, 1);
    
    setFormData({
      ...formData,
      units: updatedUnits
    });
  };

  const addAmenity = () => {
    if (amenityInput.trim() !== '') {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (index) => {
    const updatedAmenities = [...formData.amenities];
    updatedAmenities.splice(index, 1);
    
    setFormData({
      ...formData,
      amenities: updatedAmenities
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isEditing) {
        await axios.put(`/properties/${property._id}`, formData);
      } else {
        await axios.post('/properties', formData);
      }
      
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Property Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Property Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Property Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Street</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">State</label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Zip Code</label>
            <input
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Country</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Owner Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Owner Name</label>
            <input
              type="text"
              name="owner.name"
              value={formData.owner.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Owner Email</label>
            <input
              type="email"
              name="owner.email"
              value={formData.owner.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Owner Phone</label>
            <input
              type="text"
              name="owner.phone"
              value={formData.owner.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Owner Address</label>
            <input
              type="text"
              name="owner.address"
              value={formData.owner.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Property Units</h3>
          <button
            type="button"
            onClick={addUnit}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
          >
            Add Unit
          </button>
        </div>
        
        {formData.units.map((unit, index) => (
          <div key={index} className="p-4 mb-4 border rounded-md bg-gray-50">
            <div className="flex justify-between mb-2">
              <h4 className="font-medium">Unit #{index + 1}</h4>
              {formData.units.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUnit(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Unit Number</label>
                <input
                  type="text"
                  name="unitNumber"
                  value={unit.unitNumber}
                  onChange={(e) => handleUnitChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={unit.bedrooms}
                  onChange={(e) => handleUnitChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={unit.bathrooms}
                  onChange={(e) => handleUnitChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Square Feet</label>
                <input
                  type="number"
                  name="squareFeet"
                  value={unit.squareFeet}
                  onChange={(e) => handleUnitChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Monthly Rent ($)</label>
                <input
                  type="number"
                  name="rent"
                  value={unit.rent}
                  onChange={(e) => handleUnitChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <label className="inline-flex items-center mt-4">
                  <input
                    type="checkbox"
                    name="isOccupied"
                    checked={unit.isOccupied}
                    onChange={(e) => handleUnitChange(index, e)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Currently Occupied</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Amenities</h3>
        <div className="flex mb-2">
          <input
            type="text"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
            placeholder="Enter an amenity"
          />
          <button
            type="button"
            onClick={addAmenity}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
          >
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.amenities.map((amenity, index) => (
            <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
              <span>{amenity}</span>
              <button
                type="button"
                onClick={() => removeAmenity(index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows="4"
        ></textarea>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/properties')}
          className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Add Property'}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;