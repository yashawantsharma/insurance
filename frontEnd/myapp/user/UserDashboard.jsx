import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdDashboard, MdTrendingUp, MdCalendarToday, MdPayment,
  MdShield, MdArrowUpward, MdArrowDownward, MdMoreVert,
  MdCheckCircle, MdWarning, MdSchedule
} from "react-icons/md";
import { FaRupeeSign, FaFileInvoice, FaClock, FaChartLine } from "react-icons/fa";
import api from "../src/api/apis";

const UserDashboard = () => {
  const [policies, setPolicies] = useState([]);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchPolicies();
    getTheme();
    const handleThemeChange = (event) => {
      setTheme(event.detail);
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const fetchPolicies = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${api}/CustomerPolicy/mypolicies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicies(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getTheme = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${api}/user/theme`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTheme(res.data.theme);
      if (res.data.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const totalPremium = policies.reduce((sum, item) => sum + Number(item.premiumAmount || 0), 0);

  const activePolicies = policies.filter(p => p.status === "active" || !p.status);
  const upcomingPayments = policies.filter(p => {
    if (!p.nextInstallmentDate) return false;
    const due = new Date(p.nextInstallmentDate);
    const today = new Date();
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", minimumFractionDigits: 0,
    }).format(amount || 0);

  const getDaysUntilDue = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDueStatus = (dateStr) => {
    const days = getDaysUntilDue(dateStr);
    if (days === null) return { color: "gray", label: "N/A", icon: null };
    if (days < 0) return { color: "red", label: "Overdue", icon: <MdWarning size={14} /> };
    if (days <= 7) return { color: "orange", label: `${days}d left`, icon: <MdWarning size={14} /> };
    if (days <= 30) return { color: "yellow", label: `${days}d left`, icon: <MdSchedule size={14} /> };
    return { color: "green", label: `${days}d left`, icon: <MdCheckCircle size={14} /> };
  };

  const filteredPolicies =
    activeTab === "upcoming"
      ? upcomingPayments
      : activeTab === "active"
      ? activePolicies
      : policies;

  const dk = theme === "dark";

  const statCards = [
    {
      label: "Total Policies",
      value: policies.length,
      icon: <MdShield size={22} />,
      accent: "#3b82f6",
      bg: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/30",
    },
    {
      label: "Total Premium",
      value: formatCurrency(totalPremium),
      icon: <FaRupeeSign size={18} />,
      accent: "#10b981",
      bg: "from-emerald-500/20 to-emerald-600/10",
      border: "border-emerald-500/30",
    },
    {
      label: "Active Policies",
      value: activePolicies.length,
      icon: <MdCheckCircle size={22} />,
      accent: "#8b5cf6",
      bg: "from-violet-500/20 to-violet-600/10",
      border: "border-violet-500/30",
    },
    {
      label: "Due This Month",
      value: upcomingPayments.length,
      icon: <FaClock size={18} />,
      accent: "#f59e0b",
      bg: "from-amber-500/20 to-amber-600/10",
      border: "border-amber-500/30",
    },
  ];

  if (loading) {
    return (
      <div className={`ml-64 mt-14 min-h-screen flex items-center justify-center ${dk ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className={`text-sm font-medium ${dk ? "text-gray-400" : "text-gray-500"}`}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ml-64 mt-14 min-h-screen transition-all duration-300 ${dk ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .dash-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); }
        .table-row-hover { transition: background 0.15s; }
        .fade-in { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stagger-1 { animation-delay: 0.05s; }
        .stagger-2 { animation-delay: 0.1s; }
        .stagger-3 { animation-delay: 0.15s; }
        .stagger-4 { animation-delay: 0.2s; }
        .stagger-5 { animation-delay: 0.25s; }
      `}</style>

      <div className="dash-root p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-widest mb-1 ${dk ? "text-gray-500" : "text-gray-400"}`}>
              Overview
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              My Dashboard
            </h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${dk ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600 shadow-sm border border-gray-200"}`}>
            <MdCalendarToday size={16} />
            {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {statCards.map((card, i) => (
            <div
              key={i}
              className={`stat-card fade-in stagger-${i + 1} relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br ${card.bg} ${card.border} ${dk ? "" : "bg-white shadow-sm"}`}
            >
              <div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10"
                style={{ background: card.accent }}
              />
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ background: `${card.accent}22`, color: card.accent }}
              >
                {card.icon}
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dk ? "text-gray-400" : "text-gray-500"}`}>
                {card.label}
              </p>
              <p className="text-2xl font-extrabold tracking-tight">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Due Banner */}
        {upcomingPayments.length > 0 && (
          <div className={`fade-in stagger-5 mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl border ${
            dk
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <MdWarning size={20} className="flex-shrink-0" />
            <p className="text-sm font-semibold">
              You have <span className="font-extrabold">{upcomingPayments.length}</span> installment{upcomingPayments.length > 1 ? "s" : ""} due within 30 days.
              Next: <span className="font-extrabold">{formatDate(upcomingPayments[0]?.nextInstallmentDate)}</span>
            </p>
          </div>
        )}

        {/* Policies Table */}
        <div className={`fade-in rounded-2xl shadow-sm border overflow-hidden ${dk ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>

          {/* Table Header */}
          <div className={`flex items-center justify-between px-6 py-5 border-b ${dk ? "border-gray-700" : "border-gray-100"}`}>
            <div className="flex items-center gap-2">
              <FaFileInvoice size={16} className="text-blue-500" />
              <h2 className="text-base font-bold">My Policies</h2>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${dk ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                {filteredPolicies.length}
              </span>
            </div>

            {/* Tabs */}
            <div className={`flex gap-1 p-1 rounded-xl text-xs font-semibold ${dk ? "bg-gray-700" : "bg-gray-100"}`}>
              {[
                { key: "all",      label: "All"      },
                { key: "active",   label: "Active"   },
                { key: "upcoming", label: "Due Soon" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-blue-500 text-white shadow-sm"
                      : dk ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs font-bold uppercase tracking-wider ${dk ? "bg-gray-700/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                  <th className="px-6 py-4 text-left">Policy</th>
                  <th className="px-6 py-4 text-left">Premium</th>
                  <th className="px-6 py-4 text-left">Start Date</th>
                  <th className="px-6 py-4 text-left">Next Due</th>
                  <th className="px-6 py-4 text-left">Mode</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <MdShield size={40} className={dk ? "text-gray-600" : "text-gray-300"} />
                        <p className={`font-semibold ${dk ? "text-gray-500" : "text-gray-400"}`}>No policies found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPolicies.map((item, idx) => {
                    const due = getDueStatus(item.nextInstallmentDate);
                    const dueColorMap = {
                      red:    { text: "text-red-500",    bg: dk ? "bg-red-500/10"    : "bg-red-50",    border: "border-red-400"    },
                      orange: { text: "text-orange-500", bg: dk ? "bg-orange-500/10" : "bg-orange-50", border: "border-orange-400" },
                      yellow: { text: "text-yellow-500", bg: dk ? "bg-yellow-500/10" : "bg-yellow-50", border: "border-yellow-400" },
                      green:  { text: "text-green-500",  bg: dk ? "bg-green-500/10"  : "bg-green-50",  border: "border-green-400"  },
                      gray:   { text: "text-gray-500",   bg: dk ? "bg-gray-700"      : "bg-gray-100",  border: "border-gray-400"   },
                    };
                    const dc = dueColorMap[due.color];

                    return (
                      <tr
                        key={item._id}
                        className={`table-row-hover border-b ${
                          dk
                            ? "border-gray-700 hover:bg-gray-700/40"
                            : "border-gray-100 hover:bg-blue-50/40"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                              <MdShield size={14} color="#fff" />
                            </div>
                            <div>
                              <p className="font-semibold leading-tight">{item.policy?.fullName || "—"}</p>
                              <p className={`text-xs mt-0.5 font-mono ${dk ? "text-gray-500" : "text-gray-400"}`}>
                                #{(item.policy?._id || item._id)?.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-600">{formatCurrency(item.premiumAmount)}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium ${dk ? "text-gray-300" : "text-gray-600"}`}>
                            {formatDate(item.startDate)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${dc.text} ${dc.bg} ${dc.border}`}>
                            {due.icon}
                            {formatDate(item.nextInstallmentDate)}
                            <span className="opacity-70">· {due.label}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${dk ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                            {item.paymentMode || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.status === "active" || !item.status
                              ? dk ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-700"
                              : dk ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === "active" || !item.status ? "bg-green-500" : "bg-yellow-500"}`} />
                            {item.status || "Active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredPolicies.length > 0 && (
            <div className={`px-6 py-3 border-t text-xs font-medium ${dk ? "border-gray-700 text-gray-500" : "border-gray-100 text-gray-400"}`}>
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;