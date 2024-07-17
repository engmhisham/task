import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components including Filler
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Table () {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const [loading, setLoading] = useState(true);


  async function getData()
  {
    try {
      const [customersResponse, transactionsResponse] = await Promise.all([
        axios.get('https://my-json-server.typicode.com/engmhisham/task/customers'),
        axios.get('https://my-json-server.typicode.com/engmhisham/task/transactions')
      ]);
      setCustomers(customersResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, [])


  // Handle customer dropdown change
  const handleCustomerChange = (e) => {
    setSelectedCustomerId(parseInt(e.target.value) || null);
  };

  // Handle filter changes
  const handleFilterNameChange = (e) => {
    setFilterName(e.target.value);
  };

  const handleFilterAmountChange = (e) => {
    setFilterAmount(e.target.value);
  };

  // Filter transactions based on filters
  const filteredData = transactions
    .filter(t => !selectedCustomerId || t.customer_id === selectedCustomerId)
    .filter(t => t.amount.toString().includes(filterAmount))
    .filter(t => {
      if (filterName === '') return true;
      const customer = customers.find(c => c.id === t.customer_id);
      return customer?.name.toLowerCase().includes(filterName.toLowerCase());
    });

  // Generate chart data
  const chartData = {
    labels: [...new Set(filteredData.map(t => t.date))].sort(),
    datasets: [
      {
        label: 'Total Transaction Amount',
        data: [...new Set(filteredData.map(t => t.date))]
          .sort()
          .map(date => filteredData.filter(t => t.date === date).reduce((sum, t) => sum + t.amount, 0)),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'gray'
        }
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `Amount: $${tooltipItem.raw}`;
          }
        }
      },
      title: {
        display: true,
        text: 'Total Transaction Amount Per Day',
        font: {
          size: 18
        },
        color: 'gray'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: 'gray',
          font: {
            size: 14
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount',
          color: 'gray',
          font: {
            size: 14
          }
        },
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };

  // Get customer name based on customer_id
  const getCustomerName = (customer_id) => {
    const customer = customers.find(c => c.id === customer_id);
    return customer ? customer.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Customer Transactions</h1>

      {loading ? (
        <div className="w-full max-w-md mx-auto flex justify-center items-center h-32">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full max-w-3xl bg-white p-8 shadow-lg rounded-lg space-y-8">
          {/* Customer Selection and Filters */}
          <div className="flex flex-col gap-4 mb-6 p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="customer" className="block text-lg font-medium text-gray-700">Select Customer:</label>
                <select
                  id="customer"
                  onChange={handleCustomerChange}
                  value={selectedCustomerId || ''}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Customers</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-700">Filter by Name:</label>
                <input
                  id="nameFilter"
                  type="text"
                  value={filterName}
                  onChange={handleFilterNameChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="amountFilter" className="block text-sm font-medium text-gray-700">Filter by Amount:</label>
                <input
                  id="amountFilter"
                  type="text"
                  value={filterAmount}
                  onChange={handleFilterAmountChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Transaction Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 text-sm text-gray-800">{getCustomerName(transaction.customer_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">${transaction.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-600">No Transactions Available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="bg-white p-4 shadow-md rounded-lg mt-8">
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

