import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  MdDashboard, MdTrendingUp, MdTrendingDown,
  MdAttachMoney, MdPeople, MdPolicy,
  MdDateRange, MdFilterList, MdRefresh,
  MdArrowUpward, MdArrowDownward,
  MdShowChart, MdBarChart, MdPieChart,
  MdStar, MdEmojiEvents, MdLeaderboard,
  MdBusiness, MdPerson, MdCalendarToday
} from 'react-icons/md';
import { 
  FaUsers, FaUserTie, FaChartLine, 
  FaChartBar, FaChartPie, FaCrown,
  FaMedal, FaTrophy 
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart 
} from 'recharts';

const Dashboard = () => {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [dashboardData, setDashboardData] = useState({
    branches: [],
    agents: [],
    policies: [],
    customers: []
  });

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPolicies: 0,
    totalCustomers: 0,
    totalAgents: 0,
    monthlyProfit: 0,
    monthlyGrowth: 0,
    activeBranches: 0,
    pendingPolicies: 0
  });

  // Leaderboards
  const [topAgents, setTopAgents] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topBranches, setTopBranches] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Charts data
  const [revenueData, setRevenueData] = useState([]);
  const [policyTypeData, setPolicyTypeData] = useState([]);
  const [agentPerformanceData, setAgentPerformanceData] = useState([]);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [timeFrame, setTimeFrame] = useState("month"); // week, month, year

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }
    
    getTheme();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData.branches.length > 0) {
      calculateStats();
      prepareChartsData();
      prepareLeaderboards();
    }
  }, [dashboardData, dateRange, selectedBranch, selectedAgent]);

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

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      // Fetch all data in parallel
      const [branchesRes, agentsRes, policiesRes, customersRes] = await Promise.all([
        axios.get("http://localhost:5050/Branch/findall", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5050/Agent/findall", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5050/Policy/findall", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5050/user/findall", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setDashboardData({
        branches: branchesRes.data.data || [],
        agents: agentsRes.data || [],
        policies: policiesRes.data || [],
        customers: customersRes.data || []
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const { policies, customers, agents, branches } = dashboardData;
    
    // Filter by date range
    const filteredPolicies = policies.filter(p => {
      const policyDate = new Date(p.createdAt);
      return policyDate >= new Date(dateRange.start) && policyDate <= new Date(dateRange.end);
    });

    // Calculate revenue
    const totalRevenue = filteredPolicies.reduce((sum, p) => sum + (p.premium || 0), 0);
    const previousMonthRevenue = calculatePreviousMonthRevenue(policies);
    
    // Calculate monthly profit (assuming 20% profit margin)
    const monthlyProfit = totalRevenue * 0.2;
    
    // Calculate growth
    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Count active branches
    const activeBranches = branches.filter(b => b.isActive).length;
    
    // Count pending policies
    const pendingPolicies = policies.filter(p => p.status === "pending").length;

    setStats({
      totalRevenue,
      totalPolicies: policies.length,
      totalCustomers: customers.length,
      totalAgents: agents.length,
      monthlyProfit,
      monthlyGrowth,
      activeBranches,
      pendingPolicies
    });
  };

  const calculatePreviousMonthRevenue = (policies) => {
    const currentDate = new Date();
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    return policies
      .filter(p => {
        const policyDate = new Date(p.createdAt);
        return policyDate >= previousMonthStart && policyDate <= previousMonthEnd;
      })
      .reduce((sum, p) => sum + (p.premium || 0), 0);
  };

  const prepareLeaderboards = () => {
    const { agents, customers, policies, branches } = dashboardData;

    // Top agents by customers added
    const agentCustomerCount = agents.map(agent => ({
      ...agent,
      customerCount: customers.filter(c => c.addedBy === agent._id).length,
      policyCount: policies.filter(p => p.soldBy === agent._id).length,
      revenue: policies
        .filter(p => p.soldBy === agent._id)
        .reduce((sum, p) => sum + (p.premium || 0), 0)
    }));

    const sortedAgents = agentCustomerCount.sort((a, b) => b.customerCount - a.customerCount);
    setTopAgents(sortedAgents.slice(0, 5));

    // Top customers by policies bought
    const customerPolicyCount = customers.map(customer => ({
      ...customer,
      policyCount: policies.filter(p => p.customerId === customer._id).length,
      totalPremium: policies
        .filter(p => p.customerId === customer._id)
        .reduce((sum, p) => sum + (p.premium || 0), 0)
    }));

    const sortedCustomers = customerPolicyCount.sort((a, b) => b.policyCount - a.policyCount);
    setTopCustomers(sortedCustomers.slice(0, 5));

    // Top branches by performance
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

    // Recent activities
    const activities = [
      ...policies.map(p => ({ ...p, type: 'policy', date: p.createdAt })),
      ...customers.map(c => ({ ...c, type: 'customer', date: c.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
     .slice(0, 10);
    
    setRecentActivities(activities);
  };

  const prepareChartsData = () => {
    const { policies } = dashboardData;

    // Revenue over time
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

    // Policy types distribution
    const policyTypes = {};
    policies.forEach(p => {
      policyTypes[p.type || 'Other'] = (policyTypes[p.type || 'Other'] || 0) + 1;
    });
    
    setPolicyTypeData(Object.entries(policyTypes).map(([name, value]) => ({ name, value })));

    // Agent performance
    const agentPerf = topAgents.map(a => ({
      name: a.fullName,
      customers: a.customerCount,
      policies: a.policyCount,
      revenue: a.revenue
    }));
    setAgentPerformanceData(agentPerf);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className={`ml-64 mt-14 min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ml-64 mt-14 min-h-screen px-6 py-8 ${
      theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
    }`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MdDashboard className="text-blue-500" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <MdDateRange className="text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={`bg-transparent border-none focus:outline-none ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            />
            <span>-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className={`bg-transparent border-none focus:outline-none ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            />
          </div>
          
          <button
            onClick={fetchDashboardData}
            className={`p-2 rounded-lg ${
              theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
            }`}
          >
            <MdRefresh size={24} />
          </button>
        </div>
      </div>

      {/* Time Frame Selector */}
      <div className="flex gap-2 mb-6">
        {['week', 'month', 'year'].map((frame) => (
          <button
            key={frame}
            onClick={() => setTimeFrame(frame)}
            className={`px-4 py-2 rounded-lg capitalize ${
              timeFrame === frame
                ? 'bg-blue-500 text-white'
                : theme === "dark"
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100'
            }`}
          >
            {frame}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <MdAttachMoney className="text-green-600" size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              stats.monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {stats.monthlyGrowth >= 0 ? <MdArrowUpward /> : <MdArrowDownward />}
              {Math.abs(stats.monthlyGrowth).toFixed(1)}%
            </div>
          </div>
          <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="text-xs text-gray-400 mt-2">This month: ₹{stats.monthlyProfit.toLocaleString()}</p>
        </div>

        {/* Total Policies */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <MdPolicy className="text-blue-600" size={24} />
            </div>
            <span className="text-sm text-yellow-500">{stats.pendingPolicies} pending</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalPolicies}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Policies</p>
        </div>

        {/* Total Customers */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="p-3 bg-purple-100 rounded-full w-fit mb-4">
            <MdPeople className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalCustomers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
        </div>

        {/* Total Agents */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="p-3 bg-orange-100 rounded-full w-fit mb-4">
            <FaUserTie className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalAgents}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
          <p className="text-xs text-gray-400 mt-2">{stats.activeBranches} active branches</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Revenue Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Policy Distribution */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartPie className="text-green-500" />
            Policy Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={policyTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => entry.name}
                outerRadius={80}
                fill="#8884d8"
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

      {/* Leaderboards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Agents */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Top Performing Agents
          </h3>
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div key={agent._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{agent.fullName}</p>
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

        {/* Top Customers */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCrown className="text-purple-500" />
            Top Customers
          </h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
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

        {/* Top Branches */}
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MdBusiness className="text-blue-500" />
            Top Branches
          </h3>
          <div className="space-y-4">
            {topBranches.map((branch, index) => (
              <div key={branch._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{branch.branchName}</p>
                    <p className="text-xs text-gray-500">{branch.agentCount} agents</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{branch.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={`p-6 rounded-xl shadow-lg ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Details</th>
                <th className="text-left py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    {new Date(activity.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.type === 'policy' 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {activity.type === 'policy' 
                      ? `New policy sold to ${activity.customerName || 'customer'}`
                      : `New customer ${activity.name || ''} registered`
                    }
                  </td>
                  <td className="py-3 px-4">
                    {activity.premium ? `₹${activity.premium}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;