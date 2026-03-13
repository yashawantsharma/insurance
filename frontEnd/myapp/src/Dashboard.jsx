import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdBusiness, MdPeople, MdPolicy, MdAttachMoney,
  MdTrendingUp, MdTrendingDown, MdDateRange,
  MdRefresh, MdFilterList, MdClose,
  MdStar, MdEmojiEvents, MdLeaderboard,
  MdPerson, MdLocationOn, MdPhone, MdEmail,
  MdCheckCircle, MdCancel, MdDashboard
} from 'react-icons/md';
import { FaUserTie, FaUsers, FaChartLine, FaCrown, FaMedal } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';

const Dashboard = () => {
  const [branches, setBranches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [timeFrame, setTimeFrame] = useState("month");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    monthlyGrowth: 0,
    totalPolicies: 0,
    activePolicies: 0,
    pendingPolicies: 0,
    totalCustomers: 0,
    newCustomers: 0,
    totalAgents: 0,
    activeAgents: 0,
    totalBranches: 0,
    activeBranches: 0
  });

  const [topAgents, setTopAgents] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topBranches, setTopBranches] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const [revenueData, setRevenueData] = useState([]);
  const [policyTypeData, setPolicyTypeData] = useState([]);
  const [branchPerformanceData, setBranchPerformanceData] = useState([]);

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0284c7'];

  useEffect(() => {
    fetchData();
    getTheme();
  }, []);

  useEffect(() => {
    if (branches.length > 0 && agents.length > 0 && policies.length > 0) {
      calculateStats();
      prepareChartsData();
      prepareLeaderboards();
      setLoading(false);
    }
    const handleThemeChange = (event) => {
            setTheme(event.detail);
            applyThemeToDocument(event.detail);
        };
        window.addEventListener('themeChange', handleThemeChange);
        return () => {
            window.removeEventListener('themeChange', handleThemeChange);
        };
  }, [branches, agents, policies, customers, dateRange, selectedBranch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchRes, agentRes, policyRes, customerRes] = await Promise.all([
        axios.get("http://localhost:5050/branch/findall"),
        axios.get("http://localhost:5050/agent/findall"),
        axios.get("http://localhost:5050/police/findall"),
        axios.get("http://localhost:5050/user/findall")
      ]);

      setBranches(branchRes.data.data || branchRes.data || []);
      setAgents(agentRes.data || []);
      setPolicies(policyRes.data || []);
      setCustomers(customerRes.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getTheme = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5050/user/theme", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTheme(res.data.theme);
    } catch (error) {
      console.error("Error fetching theme:", error);
    }
  };

  const calculateStats = () => {
    const filteredPolicies = policies.filter(p => {
      const policyDate = new Date(p.createdAt);
      return policyDate >= new Date(dateRange.start) && policyDate <= new Date(dateRange.end);
    });

    const branchFilteredPolicies = selectedBranch === "all"
      ? filteredPolicies
      : filteredPolicies.filter(p => p.branchId === selectedBranch);

    const totalRevenue = branchFilteredPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);

    const currentMonth = new Date().getMonth();
    const monthlyPolicies = policies.filter(p => {
      const date = new Date(p.createdAt);
      return date.getMonth() === currentMonth;
    });
    const monthlyRevenue = monthlyPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthPolicies = policies.filter(p => {
      const date = new Date(p.createdAt);
      return date.getMonth() === prevMonth;
    });
    const prevMonthRevenue = prevMonthPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);

    const monthlyGrowth = prevMonthRevenue > 0
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : 0;

    const monthlyProfit = monthlyRevenue * 0.2;
    const activePolicies = policies.filter(p => p.status === "active").length;
    const pendingPolicies = policies.filter(p => p.status === "pending").length;
    const newCustomers = customers.filter(c => {
      const date = new Date(c.createdAt);
      return date.getMonth() === currentMonth;
    }).length;
    const activeAgents = agents.filter(a => a.isActive).length;
    const activeBranches = branches.filter(b => b.isActive).length;

    setStats({
      totalRevenue,
      monthlyRevenue,
      monthlyProfit,
      monthlyGrowth,
      totalPolicies: policies.length,
      activePolicies,
      pendingPolicies,
      totalCustomers: customers.length,
      newCustomers,
      totalAgents: agents.length,
      activeAgents,
      totalBranches: branches.length,
      activeBranches
    });
  };

  const prepareLeaderboards = () => {
    const agentPerformance = agents.map(agent => ({
      ...agent,
      customerCount: customers.filter(c => c.addedBy === agent._id).length,
      policyCount: policies.filter(p => p.soldBy === agent._id).length,
      revenue: policies
        .filter(p => p.soldBy === agent._id)
        .reduce((sum, p) => sum + (p.premium || 0), 0)
    }));

    const sortedAgents = agentPerformance.sort((a, b) => b.customerCount - a.customerCount);
    setTopAgents(sortedAgents.slice(0, 5));

    const customerPerformance = customers.map(customer => ({
      ...customer,
      policyCount: policies.filter(p => p.customerId === customer._id).length,
      totalPremium: policies
        .filter(p => p.customerId === customer._id)
        .reduce((sum, p) => sum + (p.premium || 0), 0)
    }));

    const sortedCustomers = customerPerformance.sort((a, b) => b.policyCount - a.policyCount);
    setTopCustomers(sortedCustomers.slice(0, 5));

    const branchPerformance = branches.map(branch => ({
      ...branch,
      agentCount: agents.filter(a => a.branchId === branch._id).length,
      customerCount: customers.filter(c => c.branchId === branch._id).length,
      policyCount: policies.filter(p => p.branchId === branch._id).length,
      revenue: policies
        .filter(p => p.branchId === branch._id)
        .reduce((sum, p) => sum + (p.premium || 0), 0)
    }));

    const sortedBranches = branchPerformance.sort((a, b) => b.revenue - a.revenue);
    setTopBranches(sortedBranches.slice(0, 5));

    const activities = [
      ...policies.map(p => ({
        ...p,
        type: 'policy',
        date: p.createdAt,
        description: `New policy sold to ${p.customerName || 'customer'}`,
        amount: p.premium
      })),
      ...customers.map(c => ({
        ...c,
        type: 'customer',
        date: c.createdAt,
        description: `New customer ${c.name || ''} registered`,
        amount: null
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    setRecentActivities(activities);
  };

  const prepareChartsData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRevenue = policies
        .filter(p => p.createdAt?.startsWith(dateStr))
        .reduce((sum, p) => sum + (p.premium || 0), 0);

      last30Days.push({
        date: dateStr,
        revenue: dayRevenue
      });
    }
    setRevenueData(last30Days);

    const types = {};
    policies.forEach(p => {
      types[p.type || 'Other'] = (types[p.type || 'Other'] || 0) + 1;
    });
    setPolicyTypeData(Object.entries(types).map(([name, value]) => ({ name, value })));

    const branchPerf = topBranches.slice(0, 5).map(b => ({
      name: b.branchName,
      revenue: b.revenue,
      customers: b.customerCount
    }));
    setBranchPerformanceData(branchPerf);
  };

  if (loading) {
    return (
      <div className={`ml-64 mt-14 min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ml-64 mt-14 p-8 min-h-screen transition-all duration-300 
      ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-wide flex items-center gap-3">
            <MdDashboard className="text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>

        <div className="flex gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
            <MdDateRange className="text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={`bg-transparent border-none focus:outline-none text-sm ${theme === "dark" ? "text-white" : "text-gray-900"
                }`}
            />
            <span>-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className={`bg-transparent border-none focus:outline-none text-sm ${theme === "dark" ? "text-white" : "text-gray-900"
                }`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${theme === "dark"
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
          >
            <MdFilterList size={24} className="text-gray-600" />
          </button>

          <button
            onClick={fetchData}
            className={`p-2 rounded-lg border ${theme === "dark"
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
          >
            <MdRefresh size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`mb-6 p-4 rounded-lg border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)}>
              <MdClose size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-600">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className={`w-full p-2 rounded border ${theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
                  }`}
              >
                <option value="all">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.branchName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600">Time Frame</label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className={`w-full p-2 rounded border ${theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
                  }`}
              >
                <option value="week">Last Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600  text-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <h2 className="text-3xl font-bold mt-2">
                ₹{(stats.totalRevenue / 100000).toFixed(1)}L
              </h2>
            </div>
            <MdAttachMoney size={32} className="opacity-90" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span>This Month: ₹{(stats.monthlyRevenue / 1000).toFixed(1)}K</span>
            <span className={`flex items-center gap-1 ${stats.monthlyGrowth >= 0 ? 'text-blue-200' : 'text-red-200'
              }`}>
              {stats.monthlyGrowth >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
              {Math.abs(stats.monthlyGrowth).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Policies</p>
              <h2 className="text-3xl font-bold mt-2">{stats.totalPolicies}</h2>
            </div>
            <MdPolicy size={32} className="opacity-90" />
          </div>
          <div className="mt-4 flex gap-3 text-sm">
            <span>Active: {stats.activePolicies}</span>
            <span>Pending: {stats.pendingPolicies}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-600  text-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Customers</p>
              <h2 className="text-3xl font-bold mt-2">{stats.totalCustomers}</h2>
            </div>
            <FaUsers size={32} className="opacity-90" />
          </div>
          <p className="mt-4 text-sm">+{stats.newCustomers} this month</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Agents</p>
              <h2 className="text-3xl font-bold mt-2">{stats.totalAgents}</h2>
            </div>
            <FaUserTie size={32} className="opacity-90" />
          </div>
          <div className="mt-4 flex gap-3 text-sm">
            <span>Active: {stats.activeAgents}</span>
            <span>Branches: {stats.activeBranches}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-2xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
          <h3 className="font-semibold mb-4 text-lg">Policy Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={policyTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => entry.name}
                outerRadius={80}
                dataKey="value"
              >
                {policyTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-2xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            Top Agents
          </h3>
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div key={agent._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{agent.fullName || agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{agent.customerCount}</p>
                  <p className="text-xs text-gray-500">customers</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <FaMedal className="text-purple-600" />
            Top Customers
          </h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{customer.name || customer.fullName}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{customer.policyCount}</p>
                  <p className="text-xs text-gray-500">policies</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <MdBusiness className="text-blue-600" />
            Top Branches
          </h3>
          <div className="space-y-4">
            {topBranches.map((branch, index) => (
              <div key={branch._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{branch.branchName}</p>
                    <p className="text-xs text-gray-500">{branch.agentCount} agents</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{(branch.revenue / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
        <h2 className="font-semibold mb-6 text-lg flex items-center gap-2">
          <MdBusiness className="text-cyan-600" />
          Recent Branches
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <th className="p-3 rounded-l-lg">Branch Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Address</th>
                <th className="p-3">Contact</th>
                <th className="p-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {branches.slice(0, 5).map((b) => (
                <tr
                  key={b._id}
                  className={`border-b transition ${theme === "dark"
                    ? "hover:bg-gray-700 border-gray-700"
                    : "hover:bg-gray-50 border-gray-200"
                    }`}
                >
                  <td className="p-3 font-medium">{b.branchName}</td>
                  <td className="p-3">{b.branchCode}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <MdLocationOn className="text-gray-400" size={14} />
                      {b.address}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <MdPhone className="text-gray-400" size={14} />
                      {b.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="p-3">
                    {b.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs w-fit">
                        <MdCheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs w-fit">
                        <MdCancel size={12} />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`mt-6 p-6 rounded-2xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
        <h2 className="font-semibold mb-6 text-lg">Recent Activities</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'policy'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600'
                  }`}>
                  {activity.type === 'policy' ? <MdPolicy /> : <MdPerson />}
                </span>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </div>
              {activity.amount && (
                <span className="font-semibold text-green-600">
                  ₹{activity.amount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;