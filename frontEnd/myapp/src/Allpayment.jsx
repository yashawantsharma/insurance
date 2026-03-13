import axios from "axios";
import React, { useEffect, useState } from "react";
import { 
  FaUsers, FaUserTie, FaEnvelope, FaPhone, FaCalendarAlt, 
  FaRupeeSign, FaMoneyBillWave, FaCheckCircle, FaClock, 
  FaExclamationTriangle, FaHistory, FaFilter, FaTimes,
  FaWallet, FaCreditCard, FaUniversity, FaSearch, FaFileInvoice
} from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';

const Allpayment = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPolicies, setCustomerPolicies] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    policyId: "",
    amount: "",
    installmentNumber: 1,
    dueDate: "",
    paymentDate: new Date().toISOString().split('T')[0],
    status: "paid"
  });

  useEffect(() => {
    fetchCustomers();
    getTheme();
    const handleThemeChange = (event) => {
            setTheme(event.detail);
            applyThemeToDocument(event.detail);
        };
        window.addEventListener('themeChange', handleThemeChange);
        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
        };
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5050/user/findall",);
      setCustomers(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  const fetchCustomerPolicies = async (selectedUser) => {
    setHistoryLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5050/CustomerPolicy/findall", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const policies = res.data.data.filter(p => {
        const userId = p.user?._id || p.user;
        return userId === selectedUser._id;
      });
      setCustomerPolicies(policies);
      await fetchAllPayments(policies);
    } catch (error) {
      console.error("Error fetching customer policies:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAllPayments = async (policies) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5050/payment/findall", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const paymentsByPolicy = {};
      policies.forEach(policy => {
        const policyId = policy.policy?._id || policy.policyId;
        const policyPayments = res.data.filter(p => {
          const paymentPolicyId = p.policyId?._id || p.policyId;
          return paymentPolicyId === policyId;
        });
        paymentsByPolicy[policyId] = policyPayments;
      });
      setPaymentHistory(paymentsByPolicy);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const getTheme = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5050/user/theme", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTheme(res.data.theme);
    } catch (error) {
      console.error("Error fetching theme:", error);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerPolicies(customer);
  };

  const handleMakePayment = (policy) => {
    const policyId = policy.policy?._id || policy.policyId;
    const policyPayments = paymentHistory[policyId] || [];
    const paidInstallments = policyPayments.filter(p => p.status === 'paid').length;
    const nextInstallmentNumber = paidInstallments + 1;
    const startDate = new Date(policy.startDate);
    const nextDueDate = new Date(startDate);
    nextDueDate.setMonth(startDate.getMonth() + (nextInstallmentNumber * 6));
    setSelectedPolicy(policy);
    setPaymentData({
      policyId: policyId,
      amount: policy.premiumAmount,
      installmentNumber: nextInstallmentNumber,
      dueDate: nextDueDate.toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: "paid"
    });
    setShowPaymentModal(true);
  };

  const handleViewHistory = (policy) => {
    setSelectedPolicy(policy);
    setShowHistoryModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5050/payment/", paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Payment successful!");
      setShowPaymentModal(false);
      if (selectedCustomer) {
        await fetchCustomerPolicies(selectedCustomer);
      }
    } catch (error) {
      console.error("Error making payment:", error);
      alert(error.response?.data?.message || "Payment failed");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <FaCheckCircle className="text-green-500" size={16} />;
      case 'pending': return <FaClock className="text-yellow-500" size={16} />;
      case 'overdue': return <FaExclamationTriangle className="text-red-500" size={16} />;
      default: return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculatePolicyStats = (policy) => {
    const policyId = policy.policy?._id || policy.policyId;
    const policyPayments = paymentHistory[policyId] || [];
    const paidInstallments = policyPayments.filter(p => p.status === 'paid').length;
    const totalInstallments = policy.policy?.installmentDuration || 6;
    const totalPaidAmount = policyPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalAmount = policy.premiumAmount * totalInstallments;
    const remainingAmount = totalAmount - totalPaidAmount;
    const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
    return { paidInstallments, totalInstallments, totalPaidAmount, remainingAmount, progress };
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const filteredHistory = (policyId) => {
    const history = paymentHistory[policyId] || [];
    return filterStatus ? history.filter(p => p.status === filterStatus) : history;
  };

  return (
    <div className={`ml-64 mt-14 min-h-screen p-6 transition-all duration-300 ${
      theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
    }`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Customer Policies
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View customer policies and manage payments
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            Total Customers: {customers.length}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" 
                : "bg-white border-gray-200 text-black placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredCustomers.map(customer => (
            <div
              key={customer._id}
              onClick={() => handleCustomerSelect(customer)}
              className={`p-4 rounded-xl border-2 cursor-pointer transform hover:scale-105 transition-all duration-300 ${
                selectedCustomer?._id === customer._id
                  ? 'border-blue-500  dark:bg-blue-900/20 shadow-lg'
                  : theme === "dark" 
                    ? 'border-gray-700 hover:border-blue-500 bg-gray-800' 
                    : 'border-gray-200 hover:border-blue-500 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FaEnvelope size={12} />
                    {customer.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FaPhone size={12} />
                    {customer.phone}
                  </p>
                </div>
              </div>
              {selectedCustomer?._id === customer._id && customerPolicies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {customerPolicies.length} Polic{customerPolicies.length > 1 ? 'ies' : 'y'}
                  </p>
                </div>
              )}
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      )}

      {selectedCustomer && (
        <div className={`mt-6 rounded-xl shadow-lg p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FaUserTie className="text-blue-500" />
              {selectedCustomer.name}'s Policies
            </h2>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              Total Policies: {customerPolicies.length}
            </span>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : customerPolicies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customerPolicies.map(policy => {
                const stats = calculatePolicyStats(policy);
                return (
                  <div
                    key={policy._id}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
                      theme === "dark" ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <FaFileInvoice className="text-blue-500" size={20} />
                        <h3 className="font-bold text-lg">
                          {policy.policy?.fullName}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        policy.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {policy.status || 'Active'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 font-mono">
                      ID: {(policy.policy?._id || policy.policyId)?.slice(-8)}
                    </p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Payment Progress</span>
                        <span className="font-semibold">{stats.paidInstallments}/{stats.totalInstallments}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                          style={{ width: `${stats.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className=" dark:bg-gray-700 p-2 rounded">
                        <span className="text-gray-500 block">Premium</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(policy.premiumAmount)}
                        </span>
                      </div>
                      <div className=" dark:bg-gray-700 p-2 rounded">
                        <span className="text-gray-500 block">Paid</span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(stats.totalPaidAmount)}
                        </span>
                      </div>
                      <div className=" dark:bg-gray-700 p-2 rounded">
                        <span className="text-gray-500 block">Remaining</span>
                        <span className="font-bold text-orange-600">
                          {formatCurrency(stats.remainingAmount)}
                        </span>
                      </div>
                      <div className=" dark:bg-gray-700 p-2 rounded">
                        <span className="text-gray-500 block">Next Due</span>
                        <span className="font-bold text-red-500">
                          {formatDate(policy.nextInstallmentDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewHistory(policy)}
                        className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <FaHistory size={16} />
                        History
                      </button>
                      <button
                        onClick={() => handleMakePayment(policy)}
                        disabled={stats.paidInstallments >= stats.totalInstallments}
                        className={`flex-1 py-2.5 rounded-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${
                          stats.paidInstallments >= stats.totalInstallments
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                        }`}
                      >
                        <MdPayment size={16} />
                        Pay Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-3">
                <FaFileInvoice size={48} className="text-gray-400" />
                <p className="text-gray-500">No policies found for this customer</p>
              </div>
            </div>
          )}
        </div>
      )}

      {showPaymentModal && selectedPolicy && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Make Payment
            </h2>

            <div className="mb-6 p-4  dark:bg-gray-700 rounded-lg">
              <p className="font-semibold text-lg">{selectedPolicy.policy?.fullName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customer: {selectedCustomer?.name}
              </p>
              <div className="flex justify-between mt-2 text-sm">
                <span>Installment #{paymentData.installmentNumber}</span>
                <span className="font-semibold text-green-600">{formatCurrency(paymentData.amount)}</span>
              </div>
            </div>

            <form onSubmit={submitPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount *</label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      theme === "dark" 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "bg-white border-gray-200 text-black"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Date *</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      theme === "dark" 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "bg-white border-gray-200 text-black"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date *</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={paymentData.dueDate}
                    onChange={(e) => setPaymentData({...paymentData, dueDate: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      theme === "dark" 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "bg-white border-gray-200 text-black"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  value={paymentData.status}
                  onChange={(e) => setPaymentData({...paymentData, status: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-200 text-black"
                  }`}
                  required
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Pay Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3  text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedPolicy && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Payment History
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <FaFilter size={18} />
              </button>
            </div>

            <div className="mb-6 p-4  dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{selectedPolicy.policy?.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Customer: {selectedCustomer?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      filteredHistory(selectedPolicy.policy?._id || selectedPolicy.policyId)
                        .filter(p => p.status === 'paid')
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setFilterStatus("")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterStatus === "" 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("paid")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterStatus === "paid" 
                      ? ' text-white' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterStatus === "pending" 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus("overdue")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterStatus === "overdue" 
                      ? 'bg-red-500 text-white' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Overdue
                </button>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHistory(selectedPolicy.policy?._id || selectedPolicy.policyId).length > 0 ? (
                filteredHistory(selectedPolicy.policy?._id || selectedPolicy.policyId).map((payment, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(payment.status)}
                      <span className="font-semibold">
                        Installment #{payment.installmentNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-semibold text-green-600">{formatCurrency(payment.amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <span className="ml-2">{formatDate(payment.dueDate)}</span>
                      </div>
                      {payment.paymentDate && (
                        <div>
                          <span className="text-gray-500">Paid On:</span>
                          <span className="ml-2">{formatDate(payment.paymentDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No payment records found</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setFilterStatus("");
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allpayment;