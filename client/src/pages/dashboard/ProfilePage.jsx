import React, { useState, useEffect } from 'react';
import {
  User,
  Home,
  ChevronRight,
  Mail,
  Shield,
  Calendar,
  Save,
  RefreshCw,
  Phone,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  validatePhoneNumber,
  validateStreet,
  validateCity,
  validateState,
  validatePinCode,
} from '../../utils/validation';

export const ProfilePage = () => {
  const { user, updateProfile, loading } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    newPassword: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'India',
      }));
    }
  }, [user]);

  const validateField = (name, value, currentForm = formData) => {
    let error = null;

    if (name === 'fullName') {
      if (!value || !value.trim()) error = 'Full name is required';
      else if (value.trim().length < 2) error = 'Full name must be at least 2 characters';
    } else if (name === 'email') {
      if (!value || !value.trim()) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) error = 'Invalid email address';
    } else if (name === 'phone') {
      if (value && value.trim()) {
        const pRes = validatePhoneNumber(value);
        if (!pRes.isValid) error = pRes.error;
      }
    } else if (name === 'street') {
      if (value && value.trim()) error = validateStreet(value);
    } else if (name === 'city') {
      if (value && value.trim()) error = validateCity(value);
    } else if (name === 'state') {
      if (value && value.trim()) error = validateState(value);
    } else if (name === 'zipCode') {
      if (value && value.trim()) error = validatePinCode(value, currentForm.country || 'India');
    } else if (name === 'newPassword') {
      if (value && value.length < 6) error = 'Password must be at least 6 characters';
    } else if (name === 'confirmPassword') {
      if (currentForm.newPassword && value !== currentForm.newPassword) {
        error = 'Passwords do not match';
      }
    }

    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (error) updated[name] = error;
      else delete updated[name];
      return updated;
    });

    return error;
  };

  const handleInputChange = (name, value) => {
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (touched[name]) {
      validateField(name, value, updated);
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name], formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    const errors = {};
    ['fullName', 'email'].forEach((k) => {
      const err = validateField(k, formData[k], formData);
      if (err) errors[k] = err;
    });
    if (formData.phone) {
      const pErr = validateField('phone', formData.phone, formData);
      if (pErr) errors.phone = pErr;
    }
    if (formData.street || formData.city || formData.zipCode) {
      ['street', 'city', 'state', 'zipCode'].forEach((k) => {
        const err = validateField(k, formData[k], formData);
        if (err) errors[k] = err;
      });
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      addToast('Please resolve validation errors before saving', 'error');
      return;
    }

    let normalizedPhone = '';
    if (formData.phone && formData.phone.trim()) {
      const pRes = validatePhoneNumber(formData.phone);
      normalizedPhone = pRes.normalized || formData.phone.trim();
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: normalizedPhone,
    };

    if (formData.street || formData.city || formData.zipCode) {
      payload.address = {
        street: (formData.street || '').trim(),
        city: (formData.city || '').trim(),
        state: (formData.state || '').trim(),
        zipCode: (formData.zipCode || '').trim(),
        country: formData.country || 'India',
      };
    }

    if (formData.newPassword.trim()) {
      payload.password = formData.newPassword;
    }

    const success = await updateProfile(payload);
    if (success) {
      setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      addToast('Profile and address saved successfully!', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1 hover:text-[#0F291E]">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          Dashboard
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-blue-600 font-semibold">User Profile</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F291E] tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          User Profile & Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal account details, role permissions, phone contact, and saved address.
        </p>
      </div>

      <Card className="p-6 border-[#E5E0D8]/90 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {(user?.fullName || 'B')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F291E]">{user?.fullName || 'User Profile'}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user?.email || 'user@branddna.ai'}
            </p>
            <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Role: {user?.role || 'customer'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                  fieldErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                  fieldErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="e.g. 9876543210 or +919876543210"
                className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all pl-10 ${
                  fieldErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {fieldErrors.phone ? (
              <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.phone}</p>
            ) : formData.phone && !fieldErrors.phone && touched.phone ? (
              <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Valid phone format
              </p>
            ) : null}
          </div>

          {/* Address Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Default Shipping / Residential Address
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                onBlur={() => handleBlur('street')}
                placeholder="Flat / House No, Street name (min 5 chars)"
                className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                  fieldErrors.street ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                }`}
              />
              {fieldErrors.street && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder="e.g. Bangalore"
                  className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                    fieldErrors.city ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                  }`}
                />
                {fieldErrors.city && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  placeholder="e.g. Karnataka"
                  className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                    fieldErrors.state ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                  }`}
                />
                {fieldErrors.state && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / Postal Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  onBlur={() => handleBlur('zipCode')}
                  placeholder="e.g. 560001"
                  className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                    fieldErrors.zipCode ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                  }`}
                />
                {fieldErrors.zipCode && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.zipCode}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Optional)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                onBlur={() => handleBlur('newPassword')}
                className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                  fieldErrors.newPassword ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                }`}
              />
              {fieldErrors.newPassword && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full bg-[#FAF8F5] border text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
                  fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-[#E5E0D8] focus:border-slate-900'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || Object.keys(fieldErrors).length > 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

