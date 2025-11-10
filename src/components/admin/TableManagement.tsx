import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, X, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  table_number: z.string().min(1, { message: 'Table number is required' }),
  capacity: z.string().min(1, { message: 'Capacity is required' })
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, { 
      message: 'Capacity must be a positive number' 
    }),
  location: z.string().min(1, { message: 'Location is required' }),
  status: z.enum(['available', 'reserved', 'maintenance']),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;
type TableData = {
  id: string;
  table_number: string;
  capacity: number;
  location: string;
  status: 'available' | 'reserved' | 'maintenance';
  description?: string;
  created_at: string;
  updated_at: string;
};

// Mock data to use until we create a "tables" table in the database
const mockTables: TableData[] = [
  {
    id: uuidv4(),
    table_number: 'T001',
    capacity: 4,
    location: 'Main Dining',
    status: 'available',
    description: 'Window table with view',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    table_number: 'T002',
    capacity: 2,
    location: 'Terrace',
    status: 'available',
    description: 'Outdoor seating',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    table_number: 'T003',
    capacity: 6,
    location: 'Private Room',
    status: 'maintenance',
    description: 'Large table for groups',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const TableManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tables, setTables] = useState<TableData[]>(mockTables);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      table_number: '',
      capacity: '',
      location: '',
      status: 'available',
      description: ''
    }
  });

  React.useEffect(() => {
    if (editingTable) {
      form.reset({
        table_number: editingTable.table_number,
        capacity: String(editingTable.capacity),
        location: editingTable.location,
        status: editingTable.status,
        description: editingTable.description || ''
      });
    } else {
      form.reset({
        table_number: '',
        capacity: '',
        location: '',
        status: 'available',
        description: ''
      });
    }
  }, [editingTable, form]);

  // Note: This function would normally fetch from Supabase, but we're using mock data for now
  const fetchTables = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, we would fetch from Supabase here
      // For now, we're just using the mock data
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
      setIsLoading(false);
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.table_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        table.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || table.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const addTable = (values: FormValues) => {
    try {
      const newTable: TableData = {
        id: uuidv4(),
        table_number: values.table_number,
        capacity: parseInt(values.capacity),
        location: values.location,
        status: values.status,
        description: values.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTables(prevTables => [...prevTables, newTable]);
      setIsDialogOpen(false);
      toast.success('Table added successfully');
    } catch (error: any) {
      console.error('Error adding table:', error);
      toast.error(`Failed to add table: ${error.message}`);
    }
  };

  const updateTable = (id: string, values: FormValues) => {
    try {
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === id ? {
            ...table,
            table_number: values.table_number,
            capacity: parseInt(values.capacity),
            location: values.location,
            status: values.status,
            description: values.description,
            updated_at: new Date().toISOString()
          } : table
        )
      );
      
      setIsDialogOpen(false);
      setEditingTable(null);
      toast.success('Table updated successfully');
    } catch (error: any) {
      console.error('Error updating table:', error);
      toast.error(`Failed to update table: ${error.message}`);
    }
  };

  const deleteTable = (id: string) => {
    try {
      setTables(prevTables => prevTables.filter(table => table.id !== id));
      setIsDeleteDialogOpen(false);
      setDeleteTableId(null);
      toast.success('Table deleted successfully');
    } catch (error: any) {
      console.error('Error deleting table:', error);
      toast.error(`Failed to delete table: ${error.message}`);
    }
  };

  const onSubmit = (values: FormValues) => {
    if (editingTable) {
      updateTable(editingTable.id, values);
    } else {
      addTable(values);
    }
  };

  const handleEdit = (table: TableData) => {
    setEditingTable(table);
    setIsDialogOpen(true);
  };

  const handleDelete = (tableId: string) => {
    setDeleteTableId(tableId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTableId) {
      deleteTable(deleteTableId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Available
        </span>;
      case 'reserved':
        return <span className="px-2 py-1 bg-amber-900/30 text-amber-400 rounded-full text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Reserved
        </span>;
      case 'maintenance':
        return <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Maintenance
        </span>;
      default:
        return <span>{status}</span>;
    }
  };

  // Rest of the component remains the same

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-hotel-gold">Table Management</h2>
        <Button 
          onClick={() => {
            setEditingTable(null);
            setIsDialogOpen(true);
          }}
          className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Table
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
          <Input 
            placeholder="Search tables..." 
            className="pl-8 bg-hotel-slate border-hotel-gold/30 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-[180px] border-hotel-gold/30 bg-hotel-midnight text-white">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
              <SelectItem value="all">All Tables</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchTerm || filterStatus !== 'all') && (
            <Button 
              variant="outline" 
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <X className="mr-1 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="bg-hotel-slate border border-hotel-gold/20 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-hotel-gold/20 bg-hotel-midnight/50">
                <TableHead className="text-hotel-gold">Table Number</TableHead>
                <TableHead className="text-hotel-gold">Capacity</TableHead>
                <TableHead className="text-hotel-gold">Location</TableHead>
                <TableHead className="text-hotel-gold">Status</TableHead>
                <TableHead className="text-hotel-gold">Description</TableHead>
                <TableHead className="text-hotel-gold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-gold"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-white/70">
                    {searchTerm || filterStatus !== 'all' ? 'No tables match your search criteria' : 'No tables found. Add your first table to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTables.map((table) => (
                  <TableRow key={table.id} className="border-b border-hotel-gold/10 hover:bg-hotel-midnight/30">
                    <TableCell className="font-medium text-white">{table.table_number}</TableCell>
                    <TableCell className="text-white">{table.capacity} persons</TableCell>
                    <TableCell className="text-white">{table.location}</TableCell>
                    <TableCell>{getStatusBadge(table.status)}</TableCell>
                    <TableCell className="text-white/70 max-w-[200px] truncate">
                      {table.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-hotel-gold/30 bg-transparent text-hotel-gold hover:bg-hotel-midnight/50"
                          onClick={() => handleEdit(table)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-red-500/30 bg-transparent text-red-500 hover:bg-red-900/20"
                          onClick={() => handleDelete(table.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-hotel-slate border-hotel-gold/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">{editingTable ? 'Edit Table' : 'Add New Table'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="table_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Table Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. T001" 
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 4" 
                          className="bg-hotel-midnight border-hotel-gold/30 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                        <SelectItem value="Main Dining">Main Dining</SelectItem>
                        <SelectItem value="Terrace">Terrace</SelectItem>
                        <SelectItem value="Lounge">Lounge</SelectItem>
                        <SelectItem value="Private Room">Private Room</SelectItem>
                        <SelectItem value="Bar">Bar</SelectItem>
                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-hotel-midnight border-hotel-gold/30 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-hotel-slate border-hotel-gold/30 text-white">
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Additional details about this table" 
                        className="bg-hotel-midnight border-hotel-gold/30 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingTable(null);
                  }}
                  className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-hotel-gold text-hotel-midnight hover:bg-hotel-accent"
                  disabled={form.formState.isSubmitting}
                >
                  {editingTable ? 'Save Changes' : 'Add Table'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-hotel-slate border-hotel-gold/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-hotel-gold">Confirm Deletion</DialogTitle>
          </DialogHeader>
          
          <p className="py-4">
            Are you sure you want to delete this table? This action cannot be undone.
          </p>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteTableId(null);
              }}
              className="border-hotel-gold/30 text-white hover:bg-hotel-midnight/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableManagement;
