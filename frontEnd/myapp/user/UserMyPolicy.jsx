import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaRupeeSign, FaCalendarAlt, FaMoneyBillWave, FaCreditCard,
  FaWallet, FaUniversity, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaHistory, FaEye, FaDownload, FaPrint, FaTimes, FaFilter
} from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';

const UserMyPolicy = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [paymentData, setPaymentData] = useState({
    policyId: "",
    amount: "",
    installmentNumber: 1,
    dueDate: "",
    paymentDate: new Date().toISOString().split('T')[0],
    status: "paid"
  });

  useEffect(() => {
    fetchPolicies();
    getTheme();
  }, []);

  const fetchPolicies = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        "http://localhost:5050/CustomerPolicy/mypolicies",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching policies:", error);
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (policyId) => {
    setHistoryLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5050/payment/findall", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // console.log(res.data);

      const policyPayments = res.data.filter(p => {
        const paymentPolicyId = p.policyId?._id || p.policyId;
        return paymentPolicyId === policyId;
      });

      setPaymentHistory(policyPayments);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPaymentHistory([]);
    } finally {
      setHistoryLoading(false);
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

  const handleMakePayment = (policy) => {
    const policyId = policy.policy?._id || policy.policyId;
    const premiumAmount = policy.premiumAmount || policy.policy?.installmentAmount;

    const paidInstallments = paymentHistory.filter(p =>
      (p.policyId?._id || p.policyId) === policyId && p.status === 'paid'
    ).length;

    const nextInstallmentNumber = paidInstallments + 1;
    const startDate = new Date(policy.startDate);
    const nextDueDate = new Date(startDate);
    nextDueDate.setMonth(startDate.getMonth() + (nextInstallmentNumber * 6));

    setSelectedPolicy(policy);
    setPaymentData({
      policyId: policyId,
      amount: premiumAmount,
      installmentNumber: nextInstallmentNumber,
      dueDate: nextDueDate.toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: "paid"
    });
    setShowPaymentModal(true);
  };

  const handleViewHistory = async (policy) => {
    const policyId = policy.policy?._id || policy.policyId;
    setSelectedPolicy(policy);
    await fetchPaymentHistory(policyId);
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

      if (showHistoryModal && selectedPolicy) {
        const policyId = selectedPolicy.policy?._id || selectedPolicy.policyId;
        await fetchPaymentHistory(policyId);
      }

      fetchPolicies();

    } catch (error) {
      console.error("Error making payment:", error);
      alert(error.response?.data?.message || "Payment failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
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

  const calculateInstallmentStats = (policy) => {
    const policyId = policy.policy?._id || policy.policyId;
    const policyPayments = paymentHistory.filter(p =>
      (p.policyId?._id || p.policyId) === policyId
    );

    const paidInstallments = policyPayments.filter(p => p.status === 'paid').length;
    const totalInstallments = policy.policy?.installmentDuration || 6;
    const totalPaidAmount = policyPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
    const remainingAmount = (policy.premiumAmount * totalInstallments) - totalPaidAmount;

    return { paidInstallments, totalInstallments, totalPaidAmount, remainingAmount, progress };
  };

  const filteredHistory = paymentHistory.filter(p =>
    filterStatus ? p.status === filterStatus : true
  );

  const downloadReceipt = (payment) => {
    const receipt = `
      PAYMENT RECEIPT
      ===============
      Receipt No: ${payment._id?.slice(-8)}
      Date: ${formatDate(payment.paymentDate || payment.dueDate)}
      Policy: ${selectedPolicy?.policy?.fullName}
      Installment: #${payment.installmentNumber}
      Amount: ${formatCurrency(payment.amount)}
      Status: ${payment.status}
      Due Date: ${formatDate(payment.dueDate)}
      ===============
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment._id?.slice(-8)}.txt`;
    a.click();
  };

  const printReceipt = (payment) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            .receipt { max-width: 400px; margin: 0 auto; }
            h2 { color: #2563eb; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .status-paid { color: #059669; }
            hr { border: 1px dashed #ccc; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h2>PAYMENT RECEIPT</h2>
            <hr>
            <div class="details">
              <div class="row"><strong>Receipt No:</strong> ${payment._id?.slice(-8)}</div>
              <div class="row"><strong>Date:</strong> ${formatDate(payment.paymentDate || payment.dueDate)}</div>
              <div class="row"><strong>Policy:</strong> ${selectedPolicy?.policy?.fullName}</div>
              <div class="row"><strong>Installment:</strong> #${payment.installmentNumber}</div>
              <div class="row"><strong>Amount:</strong> ${formatCurrency(payment.amount)}</div>
              <div class="row"><strong>Status:</strong> <span class="status-paid">${payment.status}</span></div>
              <div class="row"><strong>Due Date:</strong> ${formatDate(payment.dueDate)}</div>
            </div>
            <hr>
            <p>Thank you for your payment!</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`ml-64 mt-14 min-h-screen p-6 transition-all duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Policies
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your insurance policies and payments
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            Total: {data.length} Policies
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Policies Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => {
            const stats = calculateInstallmentStats(item);

            return (
              <div
                key={item._id}
                className={`group rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border ${theme === "dark"
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {/* Policy Header */}
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {item.policy?.fullName || "Insurance Policy"}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {item.status || 'Active'}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-4 font-mono">
                  ID: {(item.policy?._id || item.policyId)?.slice(-8)}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">
                      {stats.paidInstallments}/{stats.totalInstallments} Installments
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-purple-700"
                      style={{ width: `${stats.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Policy Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Premium</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(item.premiumAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Paid Amount</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(stats.totalPaidAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Remaining</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(stats.remainingAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Start Date</span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" size={12} />
                      {formatDate(item.startDate)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Next Installment</span>
                    <span className="text-red-500 font-medium flex items-center gap-1">
                      <FaClock className="text-red-400" size={12} />
                      {formatDate(item.nextInstallmentDate)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Payment Mode</span>
                    <span className="capitalize flex items-center gap-1">
                      {item.paymentMode === 'cash' && <FaMoneyBillWave className="text-green-500" />}
                      {item.paymentMode === 'upi' && <FaWallet className="text-blue-500" />}
                      {item.paymentMode === 'card' && <FaCreditCard className="text-purple-500" />}
                      {item.paymentMode === 'bank' && <FaUniversity className="text-yellow-500" />}
                      {item.paymentMode}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleViewHistory(item)}
                    className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl"
                  >
                    <FaHistory size={16} />
                    History
                  </button>
                  <button
                    onClick={() => handleMakePayment(item)}
                    disabled={stats.paidInstallments >= stats.totalInstallments}
                    className={`flex-1 py-2.5 rounded-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl ${stats.paidInstallments >= stats.totalInstallments
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                      }`}
                  >
                    <MdPayment size={16} />
                    {stats.paidInstallments >= stats.totalInstallments ? 'Completed' : 'Pay Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="flex flex-col items-center gap-4">
            <FaMoneyBillWave size={80} className="text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-500">No Policies Found</h3>
            <p className="text-gray-400">You haven't purchased any policies yet.</p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold">
              Browse Policies
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPolicy && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Make Payment
            </h2>

            <div className="mb-6 p-4  dark:bg-gray-700 rounded-lg">
              <p className="font-semibold text-lg">{selectedPolicy.policy?.fullName}</p>
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
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
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
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
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
                    onChange={(e) => setPaymentData({ ...paymentData, dueDate: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-black"
                      }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">installmentNumber *</label>

                <input
                  type="number"
                  value={paymentData.installmentNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, installmentNumber: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-black"
                    }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  value={paymentData.status}
                  onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${theme === "dark"
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
                  className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal && selectedPolicy && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-3xl transform transition-all duration-300 scale-100 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
          >
            {/* Modal Header */}
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

            {/* Policy Summary */}
            <div className="mb-6 p-4  dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{selectedPolicy.policy?.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Policy ID: {(selectedPolicy.policy?._id || selectedPolicy.policyId)?.slice(-8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(paymentHistory.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            {showFilters && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setFilterStatus("")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterStatus === ""
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("paid")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterStatus === "paid"
                      ? 'bg-green-500 text-white'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterStatus === "pending"
                      ? 'bg-yellow-500 text-white'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus("overdue")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterStatus === "overdue"
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                >
                  Overdue
                </button>
              </div>
            )}

            {/* History List */}
            {historyLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredHistory.map((payment, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transform hover:scale-[1.02] transition-all duration-300 ${theme === "dark" ? "border-gray-700 hover:bg-gray-750" : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
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

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => printReceipt(payment)}
                          className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Print Receipt"
                        >
                          <FaPrint size={16} />
                        </button>
                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Download Receipt"
                        >
                          <FaDownload size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <FaHistory size={48} className="text-gray-400" />
                  <p className="text-gray-500">No payment records found</p>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setFilterStatus("");
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <FaTimes size={14} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMyPolicy;