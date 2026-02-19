'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { tripAPI } from '../../../services/api';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Calendar, 
  MapPin, 
  Wallet, 
  Plus, 
  Clock, 
  Loader2,
  MoreHorizontal,
  Map as MapIcon,
  Package,
  CheckCircle,
  Navigation,
  Circle,
  Sun,
  Cloud,
  CloudRain,
  Crown,
  MessageCircle,
  UserPlus,
  TrendingUp,
  ChevronDown,
  Trash2,
  Hotel,
  Utensils,
  Car,
  Mountain,
  ShoppingBag,
  AlertTriangle,
  Lightbulb,
  Droplet,
  Zap,
  Scale,
  Download
} from 'lucide-react';

type Tab = 'itinerary' | 'expenses' | 'packing';
type StopStatus = 'planning' | 'traveling' | 'completed';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  status: 'planning' | 'traveling' | 'completed';
  isPublic?: boolean;
  budget?: number;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
  } | string;
  collaborators: Array<{
    userId: {
      _id: string;
      name: string;
      profilePicture?: string;
      username?: string;
    };
    role: string;
    status: string;
  }>;
  userAccess?: {
    isOwner: boolean;
    isAcceptedCollaborator: boolean;
    hasPendingRequest: boolean;
    canEdit: boolean;
  };
}


interface ItineraryStop {
  _id: string;
  name: string;
  activity: string;
  time: string;
  status: StopStatus;
  createdBy?: {
    _id: string;
    name: string;
  };
}

interface Expense {
  _id: string;
  item: string;
  amount: number;
  category: string;
  createdAt: string;
  createdBy?: {
    _id: string;
    name: string;
  };
}

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const tripId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [packingItems, setPackingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [showEditStop, setShowEditStop] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddPackingItem, setShowAddPackingItem] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | StopStatus>('all');
  const [showStopMenu, setShowStopMenu] = useState<string | null>(null);

  const [newStop, setNewStop] = useState({ name: '', activity: '', time: new Date().toISOString().split('T')[0] });
  const [editStop, setEditStop] = useState({ id: '', name: '', activity: '', time: '' });
  const [newExpense, setNewExpense] = useState({ item: '', amount: 0, category: 'other' });
  const [editBudgetValue, setEditBudgetValue] = useState(0);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [newPackingItem, setNewPackingItem] = useState({ name: '', notes: '', quantity: 1, category: 'clothing' });
  
  // Packing state
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch trip data
      const tripData = await tripAPI.getById(tripId);
      setTrip(tripData);
      
      // Fetch itinerary and expenses
      try {
        const itineraryData = await tripAPI.getItinerary(tripId);
        setItinerary(itineraryData || []);
      } catch (err) {
        console.log('Itinerary not available');
        setItinerary([]);
      }
      
      try {
        const expensesData = await tripAPI.getExpenses(tripId);
        setExpenses(expensesData || []);
      } catch (err) {
        console.log('Expenses not available');
        setExpenses([]);
      }

      // Fetch packing items
      try {
        const packingData = await tripAPI.getPackingList(tripId);
        setPackingItems(packingData || []);
      } catch (err) {
        console.log('Packing list not available');
        setPackingItems([]);
      }
      
    } catch (err: any) {
      console.error('Error fetching trip:', err);
      setError(err.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };


  const updateTripStatus = async (newStatus: 'planning' | 'traveling' | 'completed') => {
    if (!trip) return;
    try {
      await tripAPI.update(tripId, { status: newStatus });
      setTrip({ ...trip, status: newStatus });
      setShowStatusMenu(false);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update trip status');
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await tripAPI.addItineraryStop(tripId, newStop);
      setItinerary([...itinerary, added]);
      setNewStop({ name: '', activity: '', time: new Date().toISOString().split('T')[0] });
      setShowAddStop(false);
    } catch (err) {
      console.error('Failed to add stop:', err);
      alert('Failed to add stop. Please try again.');
    }
  };

  const handleEditStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await tripAPI.updateItineraryStop(editStop.id, {
        name: editStop.name,
        activity: editStop.activity,
        time: editStop.time
      });
      setItinerary(itinerary.map(s => s._id === editStop.id ? updated : s));
      setEditStop({ id: '', name: '', activity: '', time: '' });
      setShowEditStop(false);
    } catch (err) {
      console.error('Failed to update stop:', err);
      alert('Failed to update stop. Please try again.');
    }
  };

  const openEditStopModal = (stop: ItineraryStop) => {
    setEditStop({
      id: stop._id,
      name: stop.name,
      activity: stop.activity || '',
      time: stop.time.split('T')[0]
    });
    setShowEditStop(true);
    setShowStopMenu(null);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await tripAPI.addExpense(tripId, newExpense);
      setExpenses([...expenses, added]);
      setNewExpense({ item: '', amount: 0, category: 'other' });
      setShowAddExpense(false);
    } catch (err) {
      console.error('Failed to add expense:', err);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Delete this stop?')) return;
    try {
      await tripAPI.deleteItineraryStop(stopId);
      setItinerary(itinerary.filter(s => s._id !== stopId));
      setShowStopMenu(null);
    } catch (err) {
      console.error('Failed to delete stop:', err);
      alert('Failed to delete stop. Please try again.');
    }
  };

  const handleUpdateStopStatus = async (stopId: string, newStatus: StopStatus) => {
    try {
      await tripAPI.updateItineraryStop(stopId, { status: newStatus });
      setItinerary(itinerary.map(s => 
        s._id === stopId ? { ...s, status: newStatus } : s
      ));
      setShowStopMenu(null);
    } catch (err) {
      console.error('Failed to update stop status:', err);
      alert('Failed to update stop status. Please try again.');
    }
  };

  // PDF Export Functions
  const exportItineraryToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(5, 148, 103);
    doc.text(trip?.title || 'Trip Itinerary', 14, 20);
    
    // Trip Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${trip?.destination}, ${trip?.country}`, 14, 28);
    doc.text(`${formatDateShort(trip?.startDate || '')} - ${formatDateShort(trip?.endDate || '')}`, 14, 34);
    
    // Itinerary Table
    const tableData = itinerary.map((stop, idx) => [
      `Day ${idx + 1}`,
      stop.name,
      formatDateShort(stop.time),
      stop.status.toUpperCase(),
      stop.activity || '-'
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [['Day', 'Stop', 'Date', 'Status', 'Activity']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [5, 148, 103], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        4: { cellWidth: 60 }
      }
    });
    
    doc.save(`${trip?.title || 'trip'}-itinerary.pdf`);
  };

  const exportExpensesToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(5, 148, 103);
    doc.text(trip?.title || 'Trip Expenses', 14, 20);
    
    // Trip Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${trip?.destination}, ${trip?.country}`, 14, 28);
    
    // Budget Summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Spent: $${totalExpenses.toFixed(2)}`, 14, 40);
    if (budget > 0) {
      doc.text(`Budget: $${budget.toFixed(2)}`, 14, 47);
      doc.text(`Remaining: $${(budget - totalExpenses).toFixed(2)}`, 14, 54);
    }
    
    // Expenses Table
    const tableData = expenses.map(expense => [
      expense.item,
      expense.category.toUpperCase(),
      `$${expense.amount.toFixed(2)}`,
      new Date(expense.createdAt).toLocaleDateString(),
      expense.createdBy?.name || 'You'
    ]);
    
    autoTable(doc, {
      startY: budget > 0 ? 62 : 55,
      head: [['Item', 'Category', 'Amount', 'Date', 'Created By']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [5, 148, 103], textColor: 255 },
      styles: { fontSize: 9 },
      foot: [[{ content: `Total: $${totalExpenses.toFixed(2)}`, colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }]],
      footStyles: { fillColor: [5, 148, 103], textColor: 255 }
    });
    
    doc.save(`${trip?.title || 'trip'}-expenses.pdf`);
  };

  const exportPackingToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(5, 148, 103);
    doc.text(trip?.title || 'Packing List', 14, 20);
    
    // Trip Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${trip?.destination}, ${trip?.country}`, 14, 28);
    
    // Progress
    const progress = calculatePackingProgress();
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Progress: ${progress.packed}/${progress.total} items (${progress.percentage}%)`, 14, 40);
    
    // Group by category
    const categories = ['clothing', 'electronics', 'gear', 'medical', 'documents', 'toiletries', 'food', 'other'];
    let startY = 50;
    
    categories.forEach(category => {
      const categoryItems = packingItems.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        // Category Header
        doc.setFontSize(14);
        doc.setTextColor(5, 148, 103);
        doc.text(category.charAt(0).toUpperCase() + category.slice(1), 14, startY);
        
        // Items Table
        const tableData = categoryItems.map(item => [
          item.isPacked ? '✓' : '☐',
          item.name,
          `x${item.quantity}`,
          item.notes || '-',
          item.createdBy?.name || 'You'
        ]);
        
        autoTable(doc, {
          startY: startY + 5,
          head: [['✓', 'Item', 'Qty', 'Notes', 'Added By']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [5, 148, 103], textColor: 255, fontSize: 8 },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 10 },
            2: { cellWidth: 15 }
          },
          didDrawPage: (data) => {
            if (data.cursor) {
              startY = data.cursor.y + 10;
            }
          }
        });
        
        startY = (doc as any).lastAutoTable.finalY + 10;
      }
    });
    
    doc.save(`${trip?.title || 'trip'}-packing-list.pdf`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper functions for expenses
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactElement> = {
      accommodation: <Hotel className="w-6 h-6" />,
      food: <Utensils className="w-6 h-6" />,
      transport: <Car className="w-6 h-6" />,
      transportation: <Car className="w-6 h-6" />,
      activities: <Mountain className="w-6 h-6" />,
      shopping: <ShoppingBag className="w-6 h-6" />,
      other: <MoreHorizontal className="w-6 h-6" />
    };
    return icons[category] || icons.other;
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      accommodation: 'bg-[#3b82f6]/10 text-[#3b82f6]',
      food: 'bg-[#f59e0b]/10 text-[#f59e0b]',
      transport: 'bg-[#a855f7]/10 text-[#a855f7]',
      transportation: 'bg-[#a855f7]/10 text-[#a855f7]',
      activities: 'bg-[#059467]/10 text-[#059467]',
      shopping: 'bg-pink-500/10 text-pink-500',
      other: 'bg-gray-500/10 text-gray-500'
    };
    return styles[category] || styles.other;
  };

  const calculateCategoryBreakdown = () => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0
    }));
  };

  const calculateCollaboratorSpending = () => {
    const collaboratorTotals: Record<string, { name: string; amount: number; profilePicture?: string; username?: string }> = {};
    
    // Build a map of userId to user info from trip data
    const userMap: Record<string, { name: string; profilePicture?: string; username?: string }> = {};
    
    // Add trip owner
    if (trip && typeof trip.userId === 'object') {
      userMap[trip.userId._id] = {
        name: trip.userId.name,
        profilePicture: trip.userId.profilePicture,
        username: undefined
      };
    }
    
    // Add collaborators
    if (trip?.collaborators) {
      trip.collaborators.forEach((collab) => {
        if (collab.status === 'accepted' && typeof collab.userId === 'object') {
          userMap[collab.userId._id] = {
            name: collab.userId.name,
            profilePicture: collab.userId.profilePicture,
            username: collab.userId.username
          };
        }
      });
    }
    
    // Calculate spending per user
    expenses.forEach((expense) => {
      if (expense.createdBy) {
        const userId = expense.createdBy._id;
        if (!collaboratorTotals[userId]) {
          const userInfo = userMap[userId] || {
            name: expense.createdBy.name,
            profilePicture: undefined,
            username: undefined
          };
          
          collaboratorTotals[userId] = {
            name: userInfo.name,
            amount: 0,
            profilePicture: userInfo.profilePicture,
            username: userInfo.username
          };
        }
        collaboratorTotals[userId].amount += expense.amount;
      }
    });

    return Object.entries(collaboratorTotals)
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        amount: data.amount,
        profilePicture: data.profilePicture,
        username: data.username
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await tripAPI.deleteExpense(expenseId);
      setExpenses(expenses.filter(e => e._id !== expenseId));
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  // Helper functions for packing
  const togglePackingItem = async (itemId: string) => {
    const item = packingItems.find(i => i._id === itemId);
    if (!item) return;

    try {
      await tripAPI.updatePackingItem(itemId, { isPacked: !item.isPacked });
      setPackingItems(packingItems.map(i => 
        i._id === itemId 
          ? { ...i, isPacked: !i.isPacked }
          : i
      ));
    } catch (err) {
      console.error('Failed to update packing item:', err);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDeletePackingItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    
    try {
      await tripAPI.deletePackingItem(itemId);
      setPackingItems(packingItems.filter(i => i._id !== itemId));
    } catch (err) {
      console.error('Failed to delete packing item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleAddPackingItemFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackingItem.name.trim()) {
      alert('Please enter an item name');
      return;
    }
    
    try {
      const newItem = await tripAPI.addPackingItem(tripId, {
        name: newPackingItem.name,
        category: newPackingItem.category,
        quantity: newPackingItem.quantity,
        notes: newPackingItem.notes
      });
      
      setPackingItems([...packingItems, newItem]);
      setNewPackingItem({ name: '', notes: '', quantity: 1, category: 'clothing' });
      setShowAddPackingItem(false);
    } catch (err) {
      console.error('Failed to add packing item:', err);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await tripAPI.updatePackingItem(itemId, { quantity: newQuantity });
      setPackingItems(packingItems.map(i => 
        i._id === itemId 
          ? { ...i, quantity: newQuantity }
          : i
      ));
      setEditingQuantity(null);
    } catch (err) {
      console.error('Failed to update quantity:', err);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const calculatePackingProgress = () => {
    const total = packingItems.length;
    const packed = packingItems.filter(item => item.isPacked).length;
    return {
      total,
      packed,
      percentage: total > 0 ? Math.round((packed / total) * 100) : 0
    };
  };

  const getPackingCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactElement> = {
      'Clothing': <Package className="w-5 h-5" />,
      'Electronics': <Zap className="w-5 h-5" />,
      'Toiletries': <Droplet className="w-5 h-5" />,
      'Documents': <Calendar className="w-5 h-5" />,
      'Gear': <Mountain className="w-5 h-5" />,
      'Medical': <Plus className="w-5 h-5" />
    };
    return icons[category] || <Package className="w-5 h-5" />;
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'traveling': return <Navigation className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#059467] text-white';
      case 'traveling': return 'bg-[#f59e0b] text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const filteredItinerary = statusFilter === 'all' 
    ? itinerary 
    : itinerary.filter(stop => stop.status === statusFilter);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budget = trip?.budget || 0;

  const handleUpdateBudget = async () => {
    if (!trip) return;
    try {
      await tripAPI.update(tripId, { budget: editBudgetValue });
      setTrip({ ...trip, budget: editBudgetValue });
      setShowEditBudget(false);
    } catch (err) {
      console.error('Failed to update budget:', err);
      alert('Failed to update budget. Please try again.');
    }
  };

  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) {
      alert('Please enter a username');
      return;
    }
    
    try {
      const result = await tripAPI.inviteCollaborator(tripId, inviteUsername, inviteRole);
      alert(`Successfully invited ${inviteUsername} to the trip!`);
      setInviteUsername('');
      setInviteRole('editor');
      setShowInviteModal(false);
      // Refresh trip data to show new collaborator
      fetchTripData();
    } catch (err: any) {
      console.error('Failed to invite collaborator:', err);
      alert(err.message || 'Failed to invite collaborator. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#059467] animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !trip) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Trip not found'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-[#059467] text-white rounded-full font-bold hover:bg-[#047854]"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d]">
        {/* Hero Section */}
        <section className="relative h-[400px] w-full overflow-hidden">
          <img
            src={trip.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="container mx-auto h-full px-4 md:px-10 relative flex flex-col justify-between py-10">
            {/* Top Actions */}
            <div className="flex justify-end items-start gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider backdrop-blur-md border-2 border-white/20 transition-all ${getStatusColor(trip.status)}`}
                >
                  {trip.status === 'traveling' && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                  {getStatusIcon(trip.status)}
                  {trip.status}
                  <ChevronDown className="w-4 h-4" />
                </button>


                {showStatusMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    <button
                      onClick={() => updateTripStatus('planning')}
                      className="w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Circle className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-bold text-sm">Planning</p>
                        <p className="text-xs text-slate-500">Trip is being planned</p>
                      </div>
                    </button>
                    <button
                      onClick={() => updateTripStatus('traveling')}
                      className="w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Navigation className="w-5 h-5 text-[#f59e0b]" />
                      <div>
                        <p className="font-bold text-sm">Traveling</p>
                        <p className="text-xs text-slate-500">Currently on this trip</p>
                      </div>
                    </button>
                    <button
                      onClick={() => updateTripStatus('completed')}
                      className="w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5 text-[#059467]" />
                      <div>
                        <p className="font-bold text-sm">Completed</p>
                        <p className="text-xs text-slate-500">Trip has finished</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                  Adventure 2024
                </span>
              </div>
              <h1 className="text-white text-4xl md:text-6xl font-black leading-none tracking-tight">
                {trip.title}
              </h1>
              <div className="flex items-center gap-4 mt-4 text-white/80">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {formatDateShort(trip.startDate)} - {formatDateShort(trip.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">{trip.destination}, {trip.country}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-900 border-b border-[#059467]/5 sticky top-[73px] z-40">
          <div className="container mx-auto px-4 md:px-10 py-4">
            <div className="flex items-center gap-2 bg-[#f5f8f7] dark:bg-slate-800 p-1.5 rounded-full w-fit">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  activeTab === 'itinerary'
                    ? 'bg-white dark:bg-slate-700 text-[#059467] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Itinerary
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  activeTab === 'expenses'
                    ? 'bg-white dark:bg-slate-700 text-[#059467] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Expenses
              </button>
              <button
                onClick={() => setActiveTab('packing')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  activeTab === 'packing'
                    ? 'bg-white dark:bg-slate-700 text-[#059467] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Package className="w-4 h-4" />
                Packing
              </button>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-10 py-8 grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
              <>
                {/* Filters and Add Action */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAddStop(true)}
                      className="flex items-center gap-2 bg-[#059467] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#059467]/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Stop
                    </button>
                    <button
                      onClick={exportItineraryToPDF}
                      className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Export PDF
                    </button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          statusFilter === 'all'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-white dark:bg-slate-800 border border-[#059467]/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        All Stops
                      </button>
                      <button
                        onClick={() => setStatusFilter('completed')}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          statusFilter === 'completed'
                            ? 'bg-[#059467]/10 text-[#059467] border border-[#059467]/20'
                            : 'bg-white dark:bg-slate-800 border border-[#059467]/10 text-slate-600 dark:text-slate-400 hover:bg-[#059467]/5'
                        }`}
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => setStatusFilter('traveling')}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          statusFilter === 'traveling'
                            ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20'
                            : 'bg-white dark:bg-slate-800 border border-[#059467]/10 text-slate-600 dark:text-slate-400 hover:bg-[#3b82f6]/5'
                        }`}
                      >
                        Traveling
                      </button>
                      <button
                        onClick={() => setStatusFilter('planning')}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          statusFilter === 'planning'
                            ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20'
                            : 'bg-white dark:bg-slate-800 border border-[#059467]/10 text-slate-600 dark:text-slate-400 hover:bg-[#f59e0b]/5'
                        }`}
                      >
                        Planning
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline with Dashed Line */}
                <div className="relative pb-12">
                  {/* Dashed vertical line */}
                  <div className="absolute left-[54px] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#cee9e0] dark:border-slate-700 z-0"></div>
                  
                  <div className="relative z-10 space-y-12">
                    {filteredItinerary.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
                          No stops {statusFilter !== 'all' ? statusFilter : 'planned yet'}
                        </p>
                      </div>
                    ) : (
                      filteredItinerary.map((stop, idx) => (
                        <div key={stop._id} className="relative flex gap-6">
                          {/* Day Card */}
                          <div className="flex flex-col items-center min-w-[110px]">
                            <div className={`w-20 h-24 bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center shadow-sm border ${
                              stop.status === 'traveling' 
                                ? 'border-slate-100 dark:border-slate-700 ring-2 ring-[#3b82f6]/20' 
                                : 'border-slate-100 dark:border-slate-700'
                            }`}>
                              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                                Day {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {new Date(stop.time).getDate()}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                {new Date(stop.time).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                            </div>
                            
                            {/* Status Icon */}
                            <div className={`mt-4 rounded-full p-1 ring-4 ring-[#f5f8f7] dark:ring-slate-900 ${
                              stop.status === 'completed' 
                                ? 'bg-[#059467]' 
                                : stop.status === 'traveling'
                                ? 'bg-[#3b82f6] animate-pulse'
                                : 'bg-[#f59e0b]'
                            }`}>
                              {stop.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : stop.status === 'traveling' ? (
                                <Navigation className="w-4 h-4 text-white" />
                              ) : (
                                <Clock className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>

                          {/* Stop Card */}
                          <div className={`flex-1 bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] shadow-sm border group hover:shadow-md transition-all ${
                            stop.status === 'traveling'
                              ? 'border-2 border-[#3b82f6]/30'
                              : 'border border-slate-100 dark:border-slate-800'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className={`text-xl font-bold transition-colors ${
                                stop.status === 'completed'
                                  ? 'text-slate-900 dark:text-white group-hover:text-[#059467]'
                                  : stop.status === 'traveling'
                                  ? 'text-slate-900 dark:text-white group-hover:text-[#3b82f6]'
                                  : 'text-slate-900 dark:text-white group-hover:text-[#f59e0b]'
                              }`}>
                                {stop.name}
                              </h3>
                              <button
                                onClick={() => setShowStopMenu(showStopMenu === stop._id ? null : stop._id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                <MapPin className={`w-4 h-4 ${
                                  stop.status === 'completed' ? 'text-[#059467]' :
                                  stop.status === 'traveling' ? 'text-[#3b82f6]' :
                                  'text-[#f59e0b]'
                                }`} />
                                {stop.name}
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                stop.status === 'completed' ? 'bg-[#059467]/10 text-[#059467]' :
                                stop.status === 'traveling' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                                'bg-[#f59e0b]/10 text-[#f59e0b]'
                              }`}>
                                {stop.status}
                              </span>
                            </div>
                            
                            {stop.activity && (
                              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                  "{stop.activity}"
                                </p>
                              </div>
                            )}
                            
                            {/* Actions Menu */}
                            {showStopMenu === stop._id && (
                              <div className="absolute right-6 top-16 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                                <button
                                  onClick={() => openEditStopModal(stop)}
                                  className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  Edit Stop
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-700"></div>
                                <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                                  <p className="text-xs font-bold text-slate-400 uppercase px-2 py-1">Change Status</p>
                                </div>
                                <button
                                  onClick={() => handleUpdateStopStatus(stop._id, 'planning')}
                                  className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-[#f59e0b]/10 transition-colors flex items-center gap-2"
                                  disabled={stop.status === 'planning'}
                                >
                                  <Clock className="w-4 h-4 text-[#f59e0b]" />
                                  <span>Planning</span>
                                  {stop.status === 'planning' && <CheckCircle className="w-4 h-4 text-[#f59e0b] ml-auto" />}
                                </button>
                                <button
                                  onClick={() => handleUpdateStopStatus(stop._id, 'traveling')}
                                  className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-[#3b82f6]/10 transition-colors flex items-center gap-2"
                                  disabled={stop.status === 'traveling'}
                                >
                                  <Navigation className="w-4 h-4 text-[#3b82f6]" />
                                  <span>Traveling</span>
                                  {stop.status === 'traveling' && <CheckCircle className="w-4 h-4 text-[#3b82f6] ml-auto" />}
                                </button>
                                <button
                                  onClick={() => handleUpdateStopStatus(stop._id, 'completed')}
                                  className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-[#059467]/10 transition-colors flex items-center gap-2"
                                  disabled={stop.status === 'completed'}
                                >
                                  <CheckCircle className="w-4 h-4 text-[#059467]" />
                                  <span>Completed</span>
                                  {stop.status === 'completed' && <CheckCircle className="w-4 h-4 text-[#059467] ml-auto" />}
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-700 mt-2"></div>
                                <button
                                  onClick={() => handleDeleteStop(stop._id)}
                                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Stop
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}


            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <>
                {/* Budget Overview Section */}
                <section className="bg-white dark:bg-slate-900 rounded-xl p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-800">
                  {/* Header with Total Spent and Remaining */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                      <p className="text-sm font-bold text-[#059467]/70 uppercase tracking-widest mb-1">
                        Total Spent
                      </p>
                      <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                        ${totalExpenses.toFixed(2)}
                      </h2>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-right">
                          Budget
                        </p>
                        <button
                          onClick={() => {
                            setEditBudgetValue(budget);
                            setShowEditBudget(true);
                          }}
                          className="text-[#059467] hover:text-[#047854] transition-colors"
                          title="Edit budget"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {budget > 0 ? (
                          <>
                            ${(budget - totalExpenses).toFixed(2)}{' '}
                            <span className="text-sm font-medium text-gray-400">
                              of ${budget.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-gray-400">
                            No budget set
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar with Percentage */}
                  {budget > 0 && (
                    <div className="relative mb-12">
                      <div className="h-8 w-full bg-[#f5f8f7] dark:bg-slate-800 rounded-full overflow-hidden p-1.5 shadow-inner">
                        <div 
                          className="h-full bg-[#059467] rounded-full relative transition-all"
                          style={{ width: `${Math.min((totalExpenses / budget) * 100, 100)}%` }}
                        >
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white">
                            {Math.round((totalExpenses / budget) * 100)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-3 px-1">
                        <span className="text-xs font-bold text-[#059467]">Budget Depleted</span>
                        <span className="text-xs font-bold text-gray-400">Safety Margin</span>
                      </div>
                    </div>
                  )}

                  {/* Category Breakdown Mini-Cards */}
                  {calculateCategoryBreakdown().length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {calculateCategoryBreakdown().slice(0, 4).map((cat) => {
                        const categoryColors: Record<string, { bg: string; border: string; icon: string; text: string }> = {
                          accommodation: { bg: 'bg-[#3b82f6]/5', border: 'border-[#3b82f6]/10', icon: 'bg-[#3b82f6]/20 text-[#3b82f6]', text: 'text-[#3b82f6]' },
                          food: { bg: 'bg-[#f59e0b]/5', border: 'border-[#f59e0b]/10', icon: 'bg-[#f59e0b]/20 text-[#f59e0b]', text: 'text-[#f59e0b]' },
                          transportation: { bg: 'bg-[#a855f7]/5', border: 'border-[#a855f7]/10', icon: 'bg-[#a855f7]/20 text-[#a855f7]', text: 'text-[#a855f7]' },
                          activities: { bg: 'bg-[#059467]/5', border: 'border-[#059467]/10', icon: 'bg-[#059467]/20 text-[#059467]', text: 'text-[#059467]' },
                          shopping: { bg: 'bg-pink-500/5', border: 'border-pink-500/10', icon: 'bg-pink-500/20 text-pink-500', text: 'text-pink-500' },
                          other: { bg: 'bg-gray-500/5', border: 'border-gray-500/10', icon: 'bg-gray-500/20 text-gray-500', text: 'text-gray-500' }
                        };
                        const colors = categoryColors[cat.category] || categoryColors.other;
                        
                        return (
                          <div key={cat.category} className={`p-4 rounded-xl ${colors.bg} border ${colors.border} flex items-center gap-3`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.icon}`}>
                              {getCategoryIcon(cat.category)}
                            </div>
                            <div>
                              <p className={`text-[10px] font-bold uppercase ${colors.text}`}>
                                {cat.category === 'accommodation' ? 'Stays' : 
                                 cat.category === 'food' ? 'Food' :
                                 cat.category === 'transportation' ? 'Transit' :
                                 cat.category === 'activities' ? 'Fun' : cat.category}
                              </p>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">{cat.percentage}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Action Bar */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={exportExpensesToPDF}
                      className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => setShowAddExpense(true)}
                      className="bg-[#059467] hover:bg-[#059467]/90 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#059467]/20 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      Add Expense
                    </button>
                  </div>
                </div>

                {/* Transaction List */}
                <div className="space-y-4">
                  {expenses.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
                        No expenses recorded yet
                      </p>
                    </div>
                  ) : (
                    expenses.map((expense) => (
                      <div 
                        key={expense._id}
                        className="group bg-white dark:bg-slate-900 p-5 rounded-xl flex items-center justify-between border border-transparent hover:border-[#059467]/20 hover:shadow-xl hover:shadow-[#059467]/5 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-6">
                          {/* Category Icon */}
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getCategoryStyle(expense.category)}`}>
                            {getCategoryIcon(expense.category)}
                          </div>
                          
                          {/* Details */}
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                              {expense.item}
                            </h4>
                            <p className="text-sm text-gray-400 font-medium">
                              {new Date(expense.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Created by{' '}
                              <span className="text-[#059467]/70">
                                {expense.createdBy?.name || 'You'}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Amount and Delete */}
                        <div className="flex items-center gap-8">
                          <span className="text-2xl font-black text-[#059467]">
                            ${expense.amount.toFixed(2)}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExpense(expense._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Packing Tab */}
            {activeTab === 'packing' && (
              <>
                {/* Hero Progress Card */}
                <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-[#059467]/5 p-10 mb-10 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                  {/* Background Decoration */}
                  <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#059467]/5 rounded-full blur-3xl"></div>
                  
                  {/* Progress Display */}
                  <div className="z-10 flex-shrink-0 text-center md:text-left">
                    <p className="text-[#059467] font-bold tracking-widest uppercase text-xs mb-2">
                      {trip.destination} Expedition
                    </p>
                    <h2 className="text-[48px] font-black text-slate-900 dark:text-white leading-none">
                      {packingItems.length === 0 ? 'Start Packing!' : `${calculatePackingProgress().percentage}% Packed`}
                    </h2>
                    <p className="text-slate-600 dark:text-white/60 mt-3 font-medium">
                      {packingItems.length === 0 
                        ? 'Add items to your packing list to get started' 
                        : calculatePackingProgress().percentage === 100
                        ? "You're all set for your adventure!"
                        : "You're almost ready to hit the road!"}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {packingItems.length > 0 && (
                    <div className="z-10 flex-grow w-full">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-sm font-bold text-[#059467]">Progress</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {calculatePackingProgress().packed} / {calculatePackingProgress().total} items
                        </span>
                      </div>
                      <div className="h-6 w-full bg-[#059467]/10 rounded-full overflow-hidden p-1 border border-[#059467]/5">
                        <div 
                          className="h-full bg-[#059467] rounded-full flex items-center justify-end px-2 transition-all"
                          style={{ width: `${calculatePackingProgress().percentage}%` }}
                        >
                          <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Action Bar */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Packing Categories</h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={exportPackingToPDF}
                      className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Export PDF
                    </button>
                    <button 
                      onClick={() => setShowAddPackingItem(true)}
                      className="bg-[#059467] hover:bg-[#059467]/90 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#059467]/20 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Category Checklists */}
                {(() => {
                  // Define all standard categories to always show
                  const standardCategories = ['Clothing', 'Electronics', 'Gear', 'Medical', 'Documents', 'Toiletries', 'Food', 'Other'];
                  
                  // Get any additional categories from items that aren't in standard list
                  const itemCategories = [...new Set(packingItems.map(item => item.category))];
                  const additionalCategories = itemCategories
                    .filter(cat => !standardCategories.map(c => c.toLowerCase()).includes(cat))
                    .map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
                  
                  // Combine: show all standard categories + any additional ones
                  const allCategories = [...standardCategories, ...additionalCategories];
                  
                  // Sort categories: ones with items first, then empty ones
                  const sortedCategories = allCategories.sort((a, b) => {
                    const aItems = packingItems.filter(item => item.category === a.toLowerCase()).length;
                    const bItems = packingItems.filter(item => item.category === b.toLowerCase()).length;
                    
                    // If both have items or both are empty, maintain original order
                    if ((aItems > 0 && bItems > 0) || (aItems === 0 && bItems === 0)) {
                      return allCategories.indexOf(a) - allCategories.indexOf(b);
                    }
                    
                    // Categories with items come first
                    return bItems - aItems;
                  });
                  
                  return sortedCategories.map((category) => {
                    const categoryItems = packingItems.filter(item => item.category === category.toLowerCase());
                    const unpackedCount = categoryItems.filter(item => !item.isPacked).length;
                    
                    return (
                    <div key={category} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-[#059467]/5 p-8">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[#059467] bg-[#059467]/10 p-2 rounded-xl">
                            {getPackingCategoryIcon(category)}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {category}
                          </h3>
                        </div>
                        {unpackedCount > 0 && (
                          <span className="text-xs font-bold bg-[#059467]/10 text-[#059467] px-3 py-1 rounded-full">
                            {unpackedCount} Items Remaining
                          </span>
                        )}
                      </div>

                      {/* Checklist Items */}
                      {categoryItems.length > 0 ? (
                        <div className="space-y-4">
                        {categoryItems.map((item) => (
                          <div 
                            key={item._id}
                            className={`flex items-center justify-between p-4 rounded-2xl group transition-all ${
                              item.isPacked 
                                ? 'bg-[#059467]/5 opacity-50' 
                                : 'hover:bg-[#059467]/5 border border-transparent hover:border-[#059467]/10'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {/* Checkbox */}
                              <div 
                                onClick={() => togglePackingItem(item._id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                                  item.isPacked
                                    ? 'bg-[#059467] shadow-md shadow-[#059467]/20'
                                    : 'border-2 border-[#059467]/30 group-hover:border-[#059467]'
                                }`}
                              >
                                {item.isPacked && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>

                              {/* Item Details */}
                              <div className="flex-1">
                                <p className={`font-semibold text-slate-900 dark:text-white ${item.isPacked ? 'line-through' : ''}`}>
                                  {item.name}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {item.notes}
                                  </p>
                                )}
                                {item.isPacked && item.packedBy && (
                                  <p className="text-xs text-[#059467] mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Packed by {item.packedBy.name}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right Side: Quantity, Avatar, and Delete */}
                            <div className="flex items-center gap-4">
                              {editingQuantity === item._id ? (
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  autoFocus
                                  className="w-16 text-xs font-bold text-[#059467] px-2 py-1 bg-white dark:bg-slate-800 rounded-md border-2 border-[#059467] outline-none text-center"
                                  value={tempQuantity}
                                  onChange={(e) => setTempQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                                  onBlur={() => {
                                    handleUpdateQuantity(item._id, tempQuantity);
                                  }}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateQuantity(item._id, tempQuantity);
                                    }
                                  }}
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingQuantity(item._id);
                                    setTempQuantity(item.quantity);
                                  }}
                                  className="text-xs font-bold text-[#059467] px-2 py-1 bg-white dark:bg-slate-800 rounded-md hover:bg-[#059467]/10 transition-colors"
                                  title="Click to edit quantity"
                                >
                                  x{item.quantity}
                                </button>
                              )}
                              {item.createdBy && (
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center flex-shrink-0"
                                  title={`Added by ${item.createdBy.name}`}
                                >
                                  {item.createdBy.profilePicture ? (
                                    <img
                                      src={item.createdBy.profilePicture}
                                      alt={item.createdBy.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-white font-bold text-xs">
                                      {item.createdBy.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                  )}
                                </div>
                              )}
                              {item.isPacked && item.packedBy && item.packedBy._id !== item.createdBy?._id && (
                                <div 
                                  className="w-8 h-8 rounded-full border-2 border-[#059467] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 relative"
                                  title={`Packed by ${item.packedBy.name}`}
                                >
                                  {item.packedBy.profilePicture ? (
                                    <img
                                      src={item.packedBy.profilePicture}
                                      alt={item.packedBy.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-white font-bold text-xs">
                                      {item.packedBy.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                  )}
                                  <div className="absolute -bottom-1 -right-1 bg-[#059467] rounded-full p-0.5">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => handleDeletePackingItem(item._id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                          <p className="text-sm font-medium">No items in this category yet</p>
                          <p className="text-xs mt-1">Click "Add Item" button above to add items</p>
                        </div>
                      )}
                    </div>
                  );
                  });
                })()}
              </>
            )}
          </div>


          {/* Right Column - Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Expenses Tab Sidebar */}
            {activeTab === 'expenses' && (
              <>
                {/* Budget Alert */}
                {budget > 0 && totalExpenses > budget * 0.8 && (
                  <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 p-6 rounded-xl">
                    <div className="flex items-center gap-3 text-[#f59e0b] mb-3">
                      <AlertTriangle className="w-6 h-6" />
                      <h5 className="font-black text-sm uppercase tracking-wider">
                        Budget Warning
                      </h5>
                    </div>
                    <p className="text-sm text-[#f59e0b]/80 font-medium leading-relaxed">
                      You've used <span className="font-bold">{Math.round((totalExpenses / budget) * 100)}%</span> of your budget. 
                      You have approximately <span className="font-bold">${(budget - totalExpenses).toFixed(2)}</span> remaining.
                    </p>
                  </div>
                )}

                {/* Category Insights */}
                {calculateCategoryBreakdown().length > 0 && (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h5 className="text-lg  text-black font-bold mb-8">Top Spending Category</h5>
                    
                    {/* Top Category Display */}
                    <div className="text-center mb-8">
                      <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${getCategoryStyle(calculateCategoryBreakdown()[0].category)}`}>
                        {getCategoryIcon(calculateCategoryBreakdown()[0].category)}
                      </div>
                      <span className="text-3xl font-black text-[#0f172a] dark:text-white">
                        {calculateCategoryBreakdown()[0].percentage}%
                      </span>
                      <p className="text-[10px] font-bold text-black uppercase mt-1">
                        {calculateCategoryBreakdown()[0].category}
                      </p>
                    </div>

                    {/* Category Breakdown */}
                    <div className="space-y-4">
                      {calculateCategoryBreakdown().map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${getCategoryStyle(cat.category).split(' ')[0]}`}></div>
                            <span className="text-xs font-bold text-black dark:text-black capitalize">
                              {cat.category}
                            </span>
                          </div>
                          <span className="text-xs text-black font-black">${cat.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Smart Tip */}
                <div className="bg-slate-900 p-8 rounded-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h5 className="text-white text-lg font-bold mb-2">Smart Tip</h5>
                    <p className="text-[#059467]/70 text-sm mb-6 leading-relaxed">
                      Track your daily spending to stay within budget. Consider setting category limits for better control.
                    </p>
                    <button className="w-full py-3 bg-[#059467] text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-[#047854] transition-all">
                      View Detailed Report
                    </button>
                  </div>
                  
                  {/* Abstract Background Pattern */}
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <TrendingUp className="w-32 h-32 text-white" />
                  </div>
                </div>

                {/* Collaborator Spending */}
                {calculateCollaboratorSpending().length > 0 && (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-6">
                      <UserPlus className="w-5 h-5 text-[#059467]" />
                      <h5 className="text-lg text-slate-900 dark:text-white font-bold">Team Spending</h5>
                    </div>
                    
                    <div className="space-y-4">
                      {calculateCollaboratorSpending().map((collab, index) => {
                        const percentage = totalExpenses > 0 ? Math.round((collab.amount / totalExpenses) * 100) : 0;
                        
                        return (
                          <div key={`${collab.userId}-${index}`} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {collab.profilePicture ? (
                                  <button
                                    onClick={() => collab.username && router.push(`/profile/${collab.username}`)}
                                    className={`${collab.username ? 'cursor-pointer hover:ring-2 hover:ring-[#059467] transition-all' : 'cursor-default'}`}
                                    disabled={!collab.username}
                                  >
                                    <img
                                      src={collab.profilePicture}
                                      alt={collab.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => collab.username && router.push(`/profile/${collab.username}`)}
                                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center ${collab.username ? 'cursor-pointer hover:ring-2 hover:ring-[#059467] transition-all' : 'cursor-default'}`}
                                    disabled={!collab.username}
                                  >
                                    <span className="text-white font-bold text-sm">
                                      {collab.name.charAt(0).toUpperCase()}
                                    </span>
                                  </button>
                                )}
                                <div>
                                  <button
                                    onClick={() => collab.username && router.push(`/profile/${collab.username}`)}
                                    className={`text-sm font-bold text-slate-900 dark:text-white text-left ${collab.username ? 'hover:text-[#059467] transition-colors' : ''}`}
                                    disabled={!collab.username}
                                  >
                                    {collab.name}
                                  </button>
                                  {collab.username && (
                                    <p className="text-[10px] text-slate-400 font-medium">
                                      @{collab.username}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-[#059467]">
                                  ${collab.amount.toFixed(2)}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400">
                                  {percentage}%
                                </p>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-[#059467]/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#059467] rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {calculateCollaboratorSpending().length > 1 && (
                      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Total Team
                          </span>
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            ${totalExpenses.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Packing Tab Sidebar */}
            {activeTab === 'packing' && (
              <>
                {/* Gear Suggestions */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-[#059467]/5 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-[#f59e0b]" />
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Don't Forget ({trip.destination})
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Priority Suggestion */}
                    <div className="flex items-start gap-4 p-3 bg-[#f59e0b]/5 rounded-2xl border border-[#f59e0b]/10">
                      <CloudRain className="w-5 h-5 text-[#f59e0b] mt-1" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Weather-Appropriate Gear
                        </p>
                        <p className="text-xs text-slate-600 dark:text-white/60">
                          Check local weather conditions before departure.
                        </p>
                      </div>
                    </div>

                    {/* Regular Suggestions */}
                    <div className="flex items-start gap-4 p-3 hover:bg-[#059467]/5 rounded-2xl transition-colors cursor-pointer group">
                      <Droplet className="w-5 h-5 text-[#059467]/40 group-hover:text-[#059467] mt-1" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Water Bottle
                        </p>
                        <p className="text-xs text-slate-600 dark:text-white/60">
                          Stay hydrated during your adventure.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 hover:bg-[#059467]/5 rounded-2xl transition-colors cursor-pointer group">
                      <Zap className="w-5 h-5 text-[#059467]/40 group-hover:text-[#059467] mt-1" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Power Bank
                        </p>
                        <p className="text-xs text-slate-600 dark:text-white/60">
                          Keep your devices charged on the go.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 py-3 border-2 border-[#059467]/20 text-[#059467] rounded-xl text-sm font-bold hover:bg-[#059467] hover:text-white transition-all">
                    View Full Gear Guide
                  </button>
                </div>
{/* 
                Weight Tracker
                <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#059467]/20 rounded-full blur-2xl"></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h4 className="font-bold">Weight Tracker</h4>
                    <Scale className="w-5 h-5 text-[#059467]" />
                  </div>

                  <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-4xl font-black">
                        12.5
                        <span className="text-xl font-medium text-white/50 ml-1">kg</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#059467] tracking-widest uppercase mt-2">
                        Estimated Total
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-white/60">Airline Limit</span>
                      <span className="text-[#f59e0b]">23 kg</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#059467] rounded-full transition-all"
                        style={{ width: `${Math.min((12.5 / 23) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed pt-2">
                      Weight is estimated based on typical items. Accurate scale check recommended.
                    </p>
                  </div>
                </div> */}

                {/* Pack Buddies */}
                {trip.collaborators && trip.collaborators.filter(c => c.status === 'accepted').length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-[#059467]/5 p-6">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                      Pack Buddies
                    </h4>
                    
                    <div className="flex -space-x-3 overflow-hidden">
                      {trip.collaborators.filter(c => c.status === 'accepted').slice(0, 3).map((collab, index) => (
                        <div key={`pack-buddy-${collab.userId._id}-${index}`}>
                          {collab.userId.profilePicture ? (
                            <img
                              className="inline-block h-10 w-10 rounded-full ring-4 ring-white dark:ring-slate-900"
                              src={collab.userId.profilePicture}
                              alt={collab.userId.name}
                            />
                          ) : (
                            <div
                              className="inline-block h-10 w-10 rounded-full ring-4 ring-white dark:ring-slate-900 bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center"
                            >
                              <span className="text-white font-bold text-xs">
                                {collab.userId.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      {trip.collaborators.filter(c => c.status === 'accepted').length > 3 && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#059467]/10 ring-4 ring-white dark:ring-slate-900">
                          <span className="text-xs font-bold text-[#059467]">
                            +{trip.collaborators.filter(c => c.status === 'accepted').length - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-white/50 mt-4">
                      {trip.collaborators.filter(c => c.status === 'accepted').length} collaborator{trip.collaborators.filter(c => c.status === 'accepted').length !== 1 ? 's' : ''} on this trip.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Itinerary Tab Sidebar (existing widgets) */}
            {activeTab === 'itinerary' && (
              <>
                {/* Weather Forecast Widget */}
                <div className="bg-[#059467] p-6 text-white rounded-xl shadow-xl shadow-[#059467]/20 relative overflow-hidden" style={{ borderRadius: '2.5rem' }}>
                  {/* Decor Pattern */}
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h4 className="text-sm font-bold opacity-80">Weather Forecast</h4>
                      <p className="text-lg font-black uppercase">{trip.destination}</p>
                    </div>
                    <Sun className="w-12 h-12" />
                  </div>
                  
                  <div className="flex items-end gap-2 mb-6 relative z-10">
                    <span className="text-5xl font-black">22°C</span>
                    <span className="text-sm font-bold opacity-80 mb-2">/ Sunny</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-white/10 p-3 rounded-2xl flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold opacity-70 mb-1">Mon</span>
                      <Cloud className="w-5 h-5" />
                      <span className="text-sm font-bold mt-1">19°</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold opacity-70 mb-1">Tue</span>
                      <Sun className="w-5 h-5" />
                      <span className="text-sm font-bold mt-1">24°</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold opacity-70 mb-1">Wed</span>
                      <CloudRain className="w-5 h-5" />
                      <span className="text-sm font-bold mt-1">16°</span>
                    </div>
                  </div>
                </div>

                {/* Trip Progress Widget */}
                <div className="bg-[#0d976c] p-6 rounded-xl shadow-sm text-white space-y-4" style={{ borderRadius: '2.5rem' }}>
                  <h4 className="font-bold">Trip Progress</h4>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-[white] h-full rounded-full shadow-[0_0_12px_rgba(5,148,103,0.5)] transition-all"
                      style={{ width: `${itinerary.length > 0 ? Math.round((itinerary.filter(s => s.status === 'completed').length / itinerary.length) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold opacity-80">
                    <span>{itinerary.filter(s => s.status === 'completed').length} of {itinerary.length} Stops</span>
                    <span>{itinerary.length > 0 ? Math.round((itinerary.filter(s => s.status === 'completed').length / itinerary.length) * 100) : 0}% Done</span>
                  </div>
                </div>

                {/* Collaborators */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-[#059467]/5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-blck text-xl">Team Members</h3>
                    <button 
                      onClick={() => setShowInviteModal(true)}
                      className="text-[#059467] text-xs font-black uppercase hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* Owner */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {typeof trip.userId === 'object' && trip.userId.profilePicture ? (
                            <img
                              src={trip.userId.profilePicture}
                              alt={trip.userId.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {typeof trip.userId === 'object' ? trip.userId.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1 bg-[#f59e0b] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {typeof trip.userId === 'object' ? trip.userId.name : 'Trip Owner'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Trip Owner</p>
                        </div>
                      </div>
                      <MessageCircle className="w-5 h-5 text-[#059467]" />
                    </div>

                    {/* Collaborators */}
                    {trip.collaborators && trip.collaborators
                      .filter(c => c.status === 'accepted')
                      .map((collab, index) => (
                        <div key={`team-member-${collab.userId._id}-${index}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {collab.userId.profilePicture ? (
                              <img
                                src={collab.userId.profilePicture}
                                alt={collab.userId.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {collab.userId.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{collab.userId.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Explorer</p>
                            </div>
                          </div>
                          <MessageCircle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Packing Tab Sidebar */}
            {activeTab === 'packing' && (
              <>
                {/* Packing Contributors Widget */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-[#059467]/5">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-[#059467]" />
                    <h3 className="font-black text-xl text-slate-900 dark:text-white">Packing Contributors</h3>
                  </div>
                  
                  {(() => {
                    // Calculate who has packed items
                    const packerStats: Record<string, { name: string; count: number; profilePicture?: string }> = {};
                    
                    packingItems.forEach((item) => {
                      if (item.isPacked && item.packedBy) {
                        const packerId = item.packedBy._id;
                        if (!packerStats[packerId]) {
                          packerStats[packerId] = {
                            name: item.packedBy.name,
                            count: 0,
                            profilePicture: item.packedBy.profilePicture
                          };
                        }
                        packerStats[packerId].count++;
                      }
                    });

                    const contributors = Object.entries(packerStats)
                      .map(([userId, data]) => ({ userId, ...data }))
                      .sort((a, b) => b.count - a.count);

                    return contributors.length > 0 ? (
                      <div className="space-y-4">
                        {contributors.map((contributor, index) => (
                          <div key={`packing-contributor-${contributor.userId}-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {contributor.profilePicture ? (
                                  <img
                                    src={contributor.profilePicture}
                                    alt={contributor.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-[#059467]"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center border-2 border-[#059467]">
                                    <span className="text-white font-bold text-sm">
                                      {contributor.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-[#059467] rounded-full p-0.5">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                  {contributor.name}
                                </p>
                                <p className="text-[10px] font-bold text-[#059467] uppercase">
                                  {contributor.count} item{contributor.count !== 1 ? 's' : ''} packed
                                </p>
                              </div>
                            </div>
                            <div className="bg-[#059467]/10 px-3 py-1 rounded-full">
                              <span className="text-sm font-black text-[#059467]">
                                {contributor.count}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-4 border-t border-[#059467]/10">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Total Packed
                            </p>
                            <p className="text-lg font-black text-[#059467]">
                              {packingItems.filter(i => i.isPacked).length} / {packingItems.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                          No items packed yet
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Start checking off items to see contributors
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Pack Buddies - All Team Members */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-[#059467]/5">
                  <div className="flex items-center gap-2 mb-6">
                    <Package className="w-5 h-5 text-[#059467]" />
                    <h3 className="font-black text-xl text-slate-900 dark:text-white">Pack Buddies</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Owner */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {typeof trip.userId === 'object' && trip.userId.profilePicture ? (
                          <img
                            src={trip.userId.profilePicture}
                            alt={trip.userId.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {typeof trip.userId === 'object' ? trip.userId.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-[#f59e0b] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {typeof trip.userId === 'object' ? trip.userId.name : 'Trip Owner'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Trip Owner</p>
                      </div>
                    </div>

                    {/* Collaborators */}
                    {trip.collaborators && trip.collaborators
                      .filter(c => c.status === 'accepted')
                      .map((collab, index) => (
                        <div key={`pack-buddy-${collab.userId._id}-${index}`} className="flex items-center gap-3">
                          {collab.userId.profilePicture ? (
                            <img
                              src={collab.userId.profilePicture}
                              alt={collab.userId.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {collab.userId.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{collab.userId.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Packing Partner</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-white/50 mt-4">
                    {trip.collaborators.filter(c => c.status === 'accepted').length + 1} member{trip.collaborators.filter(c => c.status === 'accepted').length !== 0 ? 's' : ''} packing for this trip.
                  </p>
                </div>
              </>
            )}
          </div>
        </main>


        {/* Add Stop Modal */}
        {showAddStop && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Add New Stop</h3>
              <form onSubmit={handleAddStop} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Stop Name
                  </label>
                  <input
                    type="text"
                    value={newStop.name}
                    onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="e.g., Kathmandu Arrival"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Activity/Notes
                  </label>
                  <textarea
                    value={newStop.activity}
                    onChange={(e) => setNewStop({ ...newStop, activity: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="Describe the activity..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newStop.time}
                    onChange={(e) => setNewStop({ ...newStop, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0f172a] dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddStop(false)}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-full bg-[#059467] text-white font-bold hover:bg-[#047854] transition-all"
                  >
                    Add Stop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Stop Modal */}
        {showEditStop && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Edit Stop</h3>
              <form onSubmit={handleEditStop} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Stop Name
                  </label>
                  <input
                    type="text"
                    value={editStop.name}
                    onChange={(e) => setEditStop({ ...editStop, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="e.g., Kathmandu Arrival"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Activity/Notes
                  </label>
                  <textarea
                    value={editStop.activity}
                    onChange={(e) => setEditStop({ ...editStop, activity: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="Describe the activity..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editStop.time}
                    onChange={(e) => setEditStop({ ...editStop, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0f172a] dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditStop(false);
                      setEditStop({ id: '', name: '', activity: '', time: '' });
                    }}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-full bg-[#059467] text-white font-bold hover:bg-[#047854] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Add Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newExpense.item}
                    onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="e.g., Hotel booking"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                  >
                    <option value="accommodation">Accommodation</option>
                    <option value="food">Food</option>
                    <option value="transportation">Transportation</option>
                    <option value="activities">Activities</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-full bg-[#059467] text-white font-bold hover:bg-[#047854] transition-all"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Budget Modal */}
        {showEditBudget && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Set Trip Budget</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Budget Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editBudgetValue || ''}
                    onChange={(e) => setEditBudgetValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Set your total budget for this trip to track spending
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditBudget(false)}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateBudget}
                    className="flex-1 px-6 py-3 rounded-full bg-[#059467] text-white font-bold hover:bg-[#047854] transition-all"
                  >
                    Save Budget
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Collaborator Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Invite Collaborator</h3>
              <form onSubmit={handleInviteCollaborator} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="Enter username"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Enter the exact username of the person you want to invite
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                  >
                    <option value="editor">Editor - Can edit trip details</option>
                    <option value="viewer">Viewer - Can only view trip</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteUsername('');
                      setInviteRole('editor');
                    }}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-full bg-[#059467] text-white font-bold hover:bg-[#047854] transition-all"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Packing Item Modal */}
        {showAddPackingItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Add Packing Item</h3>
              <form onSubmit={handleAddPackingItemFromModal} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={newPackingItem.name}
                    onChange={(e) => setNewPackingItem({ ...newPackingItem, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="e.g., Hiking boots"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newPackingItem.notes}
                    onChange={(e) => setNewPackingItem({ ...newPackingItem, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    placeholder="Add any notes or details..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={newPackingItem.quantity}
                      onChange={(e) => setNewPackingItem({ ...newPackingItem, quantity: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newPackingItem.category}
                      onChange={(e) => setNewPackingItem({ ...newPackingItem, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#059467] focus:border-transparent outline-none"
                    >
                      <option value="clothing">Clothing</option>
                      <option value="electronics">Electronics</option>
                      <option value="gear">Gear</option>
                      <option value="medical">Medical</option>
                      <option value="documents">Documents</option>
                      <option value="toiletries">Toiletries</option>
                      <option value="food">Food</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPackingItem(false);
                      setNewPackingItem({ name: '', notes: '', quantity: 1, category: 'clothing' });
                    }}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-full bg-[#059467] text-white font-bold hover:bg-[#047854] transition-all"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
         