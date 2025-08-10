import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Sparkles, GripVertical, MoreVertical, Users, Shield } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  stock: number;
  category: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    stock: '',
    category: '',
    features: '', // Temporary field for AI generation
  });
  const [additionalImages, setAdditionalImages] = useState<string[]>(['']);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [imageDialogSrc, setImageDialogSrc] = useState('');

  useEffect(() => {
    // Always load products for demo purposes
    fetchProducts();
    fetchUsers(); // Always fetch users for demo
    
    if (user) {
      checkUserRole();
    } else {
      // For demo purposes, set loading to false even without auth
      setLoading(false);
    }
  }, [user]);

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('demo'); // Set demo role instead of redirecting
        return;
      }

      if (!data || !['admin', 'super_admin'].includes(data.role)) {
        setUserRole('demo'); // Set demo role instead of redirecting
        return;
      }

      setUserRole(data.role);
    } catch (error) {
      console.error('Error:', error);
      setUserRole('demo'); // Set demo role instead of redirecting
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
        return;
      }

      // Add demo users for visual display (all with user role)
      const demoUsers = [
        {
          id: 'demo-1',
          user_id: 'demo-user-1',
          email: 'demo1@example.com (Demo)',
          role: 'user' as const,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'demo-2',
          user_id: 'demo-user-2',
          email: 'demo2@example.com (Demo)',
          role: 'user' as const,
          created_at: '2024-01-16T14:22:00Z'
        },
        {
          id: 'demo-3',
          user_id: 'demo-user-3',
          email: 'demo3@example.com (Demo)',
          role: 'user' as const,
          created_at: '2024-01-17T09:15:00Z'
        },
        {
          id: 'demo-4',
          user_id: 'demo-user-4',
          email: 'demo4@example.com (Demo)',
          role: 'user' as const,
          created_at: '2024-01-18T16:45:00Z'
        },
        {
          id: 'demo-5',
          user_id: 'demo-user-5',
          email: 'demo5@example.com (Demo)',
          role: 'user' as const,
          created_at: '2024-01-19T11:30:00Z'
        }
      ];

      // Combine real users with demo users
      setUsers([...(data || []), ...demoUsers]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching users');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    // Prevent edits in demo mode
    if (!user || userRole === 'demo') {
      toast.error('Demo mode: Editing is disabled. Please log in as an admin to make changes.');
      return;
    }
    
    // Prevent updating demo users
    if (userId.startsWith('demo-user-')) {
      toast.error('Cannot update demo user roles');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };


  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } else {
        // Transform the data to match our Product interface
        const transformedProducts = (data || []).map(product => ({
          ...product,
          images: Array.isArray(product.images) ? product.images.filter((img): img is string => typeof img === 'string') : []
        })) as Product[];
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent edits in demo mode
    if (isDemoMode) {
      toast.error('Demo mode: Editing is disabled. Please log in as an admin to make changes.');
      return;
    }
    
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    try {
      // Filter out empty additional images
      const filteredAdditionalImages = additionalImages.filter(url => url.trim().length > 0);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        images: filteredAdditionalImages,
        stock: parseInt(formData.stock) || 0,
        category: formData.category || 'general',
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      setFormData({ name: '', description: '', price: '', image_url: '', stock: '', category: '', features: '' });
      setAdditionalImages(['']);
      setEditingProduct(null);
      setShowAddForm(false); // Hide form after successful submission
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      stock: product.stock.toString(),
      category: product.category || '',
      features: '',
    });
    // Set additional images
    setAdditionalImages(product.images.length > 0 ? product.images : ['']);
    setShowAddForm(true); // Show form when editing
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDemoMode) {
      toast.error('Demo mode: Editing is disabled. Please log in as an admin to make changes.');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      return;
    }
    if (!productToDelete) return;

    try {
      // Check if product is in any cart
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('product_id', productToDelete)
        .limit(1);

      if (cartError) {
        console.error('Error checking cart items:', cartError);
        toast.error('Failed to check if product is in carts');
        return;
      }

      if (cartItems && cartItems.length > 0) {
        toast.error('Cannot delete product: it is currently in customer carts');
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);

      if (error) throw error;
      
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const generateDescription = async () => {
    if (!formData.name) {
      toast.error('Please enter a product name first');
      return;
    }

    setGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-description', {
        body: {
          productName: formData.name,
          features: formData.features || undefined,
        },
      });

      if (error) throw error;

      if (data?.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
        toast.success('Description generated successfully!');
      } else {
        throw new Error('No description received from AI');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    setFormData({ name: '', description: '', price: '', image_url: '', stock: '', category: '', features: '' });
    setAdditionalImages(['']);
  };

  const addImageInput = () => {
    setAdditionalImages(prev => [...prev, '']);
  };

  const removeImageInput = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageInput = (index: number, value: string) => {
    setAdditionalImages(prev => prev.map((img, i) => i === index ? value : img));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...additionalImages];
    const draggedItem = newImages[draggedIndex];
    
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    
    setAdditionalImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Filter products based on search and category
  const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Demo mode check
  const isDemoMode = !user || userRole === 'demo';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Demo Mode</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You're viewing the admin dashboard in demo mode. All editing features are disabled. 
                  <span className="font-medium"> Log in as an admin to access full functionality.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage your products with AI-powered descriptions
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="capitalize">
              {isDemoMode ? 'Demo Viewer' : userRole?.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {(userRole === 'super_admin' || isDemoMode) ? (
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg h-auto">
              <TabsTrigger 
                value="products" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-3 px-4 font-medium transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-3 px-4 font-medium transition-all"
              >
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <div className="flex flex-col gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Manage Products</h2>
                  <p className="text-muted-foreground">View and manage your product inventory</p>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => {
                          if (isDemoMode) {
                            toast.error('Demo mode: Editing is disabled. Please log in as an admin to make changes.');
                          } else {
                            setShowAddForm(true);
                          }
                        }} 
                        className="flex items-center gap-2 w-full sm:w-auto whitespace-nowrap"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <DialogDescription>
                          Create or edit products with AI-generated descriptions
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter product name"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="features">Key Features (for AI description)</Label>
                          <Input
                            id="features"
                            value={formData.features}
                            onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                            placeholder="e.g., Wireless, Noise Cancelling, 20 hours battery"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="description">Description</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generateDescription}
                              disabled={generatingDescription || !formData.name}
                            >
                              <Sparkles className="h-4 w-4 mr-1" />
                              {generatingDescription ? 'Generating...' : 'Generate with AI'}
                            </Button>
                          </div>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Product description will appear here..."
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Price *</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                              placeholder="0.00"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={formData.stock}
                              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="laptops">Laptops</SelectItem>
                              <SelectItem value="accessories">Accessories</SelectItem>
                              <SelectItem value="smartphones">Smartphones</SelectItem>
                              <SelectItem value="tablets">Tablets</SelectItem>
                              <SelectItem value="electronics">Electronics</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="image_url">Main Image URL *</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="image_url"
                              value={formData.image_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                              placeholder="https://example.com/main-image.jpg"
                              className="flex-1"
                            />
                             {formData.image_url && (
                               <img
                                 src={formData.image_url}
                                 alt="Main image preview"
                                 className="h-10 w-16 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                 onClick={() => setImageDialogSrc(formData.image_url)}
                                 onError={(e) => {
                                   e.currentTarget.style.display = 'none';
                                 }}
                               />
                             )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Additional Images</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addImageInput}>
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Image
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {additionalImages.map((image, index) => (
                              <div 
                                key={index} 
                                className={`
                                  flex gap-2 items-center p-3 rounded-lg border transition-all duration-200 ease-in-out
                                  ${draggedIndex === index 
                                    ? 'opacity-50 scale-105 bg-primary/10 border-primary shadow-lg transform rotate-1' 
                                    : dragOverIndex === index && draggedIndex !== null && draggedIndex !== index
                                    ? 'bg-primary/5 border-primary/50 scale-102 shadow-md animate-pulse'
                                    : 'bg-background hover:bg-muted/30 hover:scale-101 hover:shadow-sm'
                                  }
                                  ${draggedIndex !== null && draggedIndex !== index ? 'animate-fade-in' : ''}
                                `}
                                style={{
                                  transform: draggedIndex === index ? 'scale(1.02) rotate(1deg)' : 'scale(1)',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: draggedIndex === index ? '0 8px 25px rgba(0,0,0,0.15)' : undefined
                                }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, index)}
                              >
                                <div className={`
                                  flex items-center transition-transform duration-150
                                  ${draggedIndex === index 
                                    ? 'cursor-grabbing scale-110' 
                                    : 'cursor-grab hover:scale-105'
                                  }
                                `}>
                                  <GripVertical className={`
                                    h-4 w-4 transition-colors duration-150
                                    ${draggedIndex === index 
                                      ? 'text-primary' 
                                      : 'text-muted-foreground hover:text-foreground'
                                    }
                                  `} />
                                </div>
                                <span className={`
                                  text-sm font-medium w-8 transition-colors duration-150
                                  ${draggedIndex === index 
                                    ? 'text-primary' 
                                    : 'text-muted-foreground'
                                  }
                                `}>
                                  #{index + 1}
                                </span>
                                <div className="flex-1 flex items-center space-x-2">
                                  <Input
                                    value={image}
                                    onChange={(e) => updateImageInput(index, e.target.value)}
                                    placeholder={`https://example.com/image${index + 1}.jpg`}
                                    className={`
                                      flex-1 transition-all duration-150
                                      ${draggedIndex === index 
                                        ? 'border-primary/50 bg-primary/5' 
                                        : ''
                                      }
                                    `}
                                  />
                                   {image && (
                                     <img
                                       src={image}
                                       alt={`Additional image ${index + 1} preview`}
                                       className="h-10 w-16 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                       onClick={() => setImageDialogSrc(image)}
                                       onError={(e) => {
                                         e.currentTarget.style.display = 'none';
                                       }}
                                     />
                                   )}
                                </div>
                                {additionalImages.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeImageInput(index)}
                                    className="hover-scale transition-all duration-150 hover:bg-destructive/10 hover:border-destructive/50"
                                  >
                                    <Trash2 className="h-4 w-4 hover:text-destructive transition-colors duration-150" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Drag and drop to reorder images. The main image above will be the primary photo.
                          </p>
                        </div>

                        <div className="flex gap-4">
                          <Button type="submit" className="flex-1">
                            <PlusCircle className="h-4 w-4 mr-1" />
                            {editingProduct ? 'Update Product' : 'Create Product'}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid gap-6">
                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCategory !== 'all' 
                          ? 'No products match your filters.' 
                          : 'No products found. Create your first product!'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-3 items-center">
                          {/* Column 1: Title */}
                          <div className="col-span-4 sm:col-span-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                            <p className="text-xs text-muted-foreground truncate sm:hidden">{product.description}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">{product.description}</p>
                          </div>

                          {/* Column 2: Category & Image */}
                          <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              {product.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                                </Badge>
                              )}
                            </div>
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border"
                                onClick={() => setImageDialogSrc(product.image_url)}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </div>

                          {/* Column 3: Price & Stock */}
                          <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                            <Badge variant="outline" className="text-xs font-semibold w-fit">
                              ${product.price}
                            </Badge>
                            <Badge variant={product.stock > 0 ? "default" : "secondary"} className="text-xs w-fit">
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </Badge>
                          </div>

                          {/* Column 4: Actions */}
                          <div className="col-span-4 sm:col-span-1 flex gap-1 sm:gap-2 sm:flex-col sm:items-end sm:ml-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="flex-1 sm:flex-none sm:w-20 text-xs px-2 py-1 sm:px-2 sm:py-1"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteClick(product.id)}
                                  className="flex-1 sm:flex-none sm:w-20 text-xs px-2 py-1 sm:px-2 sm:py-1"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="sm:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteConfirm}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Product
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {(userRole === 'super_admin' || isDemoMode) && (
              <TabsContent value="users" className="mt-6">
                <div className="mb-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">User Management</h2>
                      <p className="text-muted-foreground">Manage user accounts and roles</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Regular Users */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Users
                      </CardTitle>
                      <CardDescription>
                        Regular user accounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {users.filter(user => user.role === 'user').map((user) => (
                          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                User ID: {user.user_id.slice(0, 8)}...
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created: {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">User</Badge>
                              <Select 
                                value={user.role} 
                                onValueChange={(value: 'user' | 'admin' | 'super_admin') => isDemoMode ? toast.error('Demo mode: Editing is disabled. Please log in as an admin to make changes.') : updateUserRole(user.user_id, value)}
                                disabled={user.user_id.startsWith('demo-user-') || isDemoMode}
                              >
                                <SelectTrigger className="w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin Users */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Administrators
                      </CardTitle>
                      <CardDescription>
                        Admin and super admin accounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {users.filter(user => ['admin', 'super_admin'].includes(user.role)).map((user) => (
                          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{user.email}</div>
                              <div className="text-sm text-muted-foreground">
                                User ID: {user.user_id.slice(0, 8)}...
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created: {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'} className="text-xs">
                                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </Badge>
                              <Select 
                                value={user.role} 
                                onValueChange={(value: 'user' | 'admin' | 'super_admin') => updateUserRole(user.user_id, value)}
                              >
                                <SelectTrigger className="w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          // Regular admin view - only products
          <div>
            <div className="flex flex-col gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">Manage Products</h2>
                <p className="text-muted-foreground">View and manage your product inventory</p>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showAddForm} onOpenChange={isDemoMode ? () => {} : setShowAddForm}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => isDemoMode ? toast.error('Demo mode: Editing is disabled. Please log in as an admin to make changes.') : setShowAddForm(true)} 
                      className="flex items-center gap-2 w-full sm:w-auto whitespace-nowrap"
                      disabled={isDemoMode}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </DialogTitle>
                      <DialogDescription>
                        Create or edit products with AI-generated descriptions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter product name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="features">Key Features (for AI description)</Label>
                        <Input
                          id="features"
                          value={formData.features}
                          onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                          placeholder="e.g., Wireless, Noise Cancelling, 20 hours battery"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="description">Description</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateDescription}
                            disabled={generatingDescription || !formData.name}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            {generatingDescription ? 'Generating...' : 'Generate with AI'}
                          </Button>
                        </div>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Product description will appear here..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Price *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="stock">Stock Quantity</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="image_url">Main Image URL</Label>
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <Label>Additional Images</Label>
                        <div className="space-y-3 mt-2">
                          {additionalImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className={`flex gap-2 items-center p-3 rounded-lg border transition-all duration-200 ${
                                dragOverIndex === index ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-background'
                              } ${draggedIndex === index ? 'opacity-50' : ''}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnter={(e) => handleDragEnter(e, index)}
                              onDragLeave={handleDragLeave}
                              onDragOver={handleDragOver}
                              onDragEnd={handleDragEnd}
                              onDrop={(e) => handleDrop(e, index)}
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <div className="flex-1 flex gap-2">
                                <Input
                                  value={imageUrl}
                                  onChange={(e) => updateImageInput(index, e.target.value)}
                                  placeholder={`Additional image ${index + 1} URL`}
                                  className="flex-1"
                                />
                                {imageUrl && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setImageDialogSrc(imageUrl)}
                                    className="px-2"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Preview ${index + 1}`}
                                      className="w-8 h-8 object-cover rounded"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </Button>
                                )}
                              </div>
                              {additionalImages.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeImageInput(index)}
                                  className="px-2 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addImageInput}
                            className="w-full"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Another Image
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingProduct ? 'Update Product' : 'Create Product'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCategory !== 'all' 
                          ? 'No products match your filters.' 
                          : 'No products found. Create your first product!'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="transition-all duration-200 hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">{product.name}</CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                              {product.description || 'No description available'}
                            </CardDescription>
                            {product.images && product.images.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {product.images.map((image, index) => (
                                  <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setImageDialogSrc(image)}
                                    className="p-1 h-auto"
                                  >
                                    <img
                                      src={image}
                                      alt={`${product.name} ${index + 1}`}
                                      className="w-12 h-12 object-cover rounded border"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(product.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteConfirm}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Product
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-lg font-semibold">
                            ${product.price}
                          </Badge>
                          <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </Badge>
                          {product.category && (
                            <Badge variant="secondary">
                              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </Badge>
                          )}
                          {product.image_url && (
                            <div className="ml-auto">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!imageDialogSrc} onOpenChange={() => setImageDialogSrc('')}>
        <DialogContent className="max-w-3xl">
          <img
            src={imageDialogSrc}
            alt="Full size preview"
            className="w-full h-auto max-h-[70vh] object-contain rounded"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
