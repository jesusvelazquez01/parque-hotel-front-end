
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const AdminDashboardOverview = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    recentBookings: [] as any[],
    monthlyData: [] as any[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch bookings for statistics
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (bookingsError) throw bookingsError;
        
        const bookingsCount = bookingsData?.length || 0;
        const pendingCount = bookingsData?.filter(booking => booking.status === 'pending').length || 0;
        const confirmedCount = bookingsData?.filter(booking => booking.status === 'confirmed').length || 0;
        
        // Calculate total revenue from confirmed bookings
        const revenue = bookingsData
          ?.filter(booking => booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out')
          .reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;
        
        // Get recent bookings (last 5)
        const recentBookings = bookingsData?.slice(0, 5) || [];
        
        // Calculate monthly data for charts
        const monthlyData = calculateMonthlyData(bookingsData || []);
        
        setStats({
          totalBookings: bookingsCount,
          pendingBookings: pendingCount,
          confirmedBookings: confirmedCount,
          totalRevenue: revenue,
          recentBookings,
          monthlyData
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, []);

  const calculateMonthlyData = (bookings: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = months.map(month => {
      const monthIndex = months.indexOf(month);
      const bookingsInMonth = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === monthIndex;
      });
      
      const revenue = bookingsInMonth
        .filter(booking => booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out')
        .reduce((sum, booking) => sum + Number(booking.total_price), 0);
      
      return {
        name: month,
        bookings: bookingsInMonth.length,
        revenue: Math.round(revenue)
      };
    });
    
    return monthlyData;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-hotel-slate/80 border-hotel-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hotel-gold">{stats.totalBookings}</div>
            <p className="text-xs text-white/70 mt-1">Across all time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-hotel-slate/80 border-hotel-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hotel-gold">{stats.pendingBookings}</div>
            <p className="text-xs text-white/70 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card className="bg-hotel-slate/80 border-hotel-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hotel-gold">{stats.confirmedBookings}</div>
            <p className="text-xs text-white/70 mt-1">Ready for check-in</p>
          </CardContent>
        </Card>
        
        <Card className="bg-hotel-slate/80 border-hotel-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hotel-gold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-white/70 mt-1">From confirmed bookings</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-hotel-slate/80 border-hotel-gold/20">
          <CardHeader>
            <CardTitle className="text-white">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Bookings']}
                  contentStyle={{ background: '#1a1b26', border: '1px solid #D1B000', borderRadius: '4px' }}
                  labelStyle={{ color: '#D1B000' }}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="#D1B000" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-hotel-slate/80 border-hotel-gold/20">
          <CardHeader>
            <CardTitle className="text-white">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ background: '#1a1b26', border: '1px solid #D1B000', borderRadius: '4px' }}
                  labelStyle={{ color: '#D1B000' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#7D7425" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-hotel-slate/80 border-hotel-gold/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-hotel-gold/20 hover:bg-transparent">
                <TableHead className="text-hotel-gold">Customer</TableHead>
                <TableHead className="text-hotel-gold">Date</TableHead>
                <TableHead className="text-hotel-gold">Status</TableHead>
                <TableHead className="text-right text-hotel-gold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <TableRow key={booking.id} className="border-b border-hotel-gold/20">
                    <TableCell className="font-medium text-white">
                      {booking.customer_name}
                    </TableCell>
                    <TableCell className="text-white">
                      {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          booking.status === 'checked_in' ? 'bg-blue-500/20 text-blue-400' :
                          booking.status === 'checked_out' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-white">
                      ₹{Number(booking.total_price).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-white/60">
                    No recent bookings
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardOverview;
