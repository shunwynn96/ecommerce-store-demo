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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    stock: '',
    features: '', // Temporary field for AI generation
  });
  const [additionalImages, setAdditionalImages] = useState<string[]>(['']);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [imageDialogSrc, setImageDialogSrc] = useState('');

  useEffect(() => {
    if (user) {
      checkUserRole();
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
        navigate('/');
        return;
      }

      if (!data || !['admin', 'super_admin'].includes(data.role)) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

      setUserRole(data.role);
      fetchProducts();
      if (data.role === 'super_admin') {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/');
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
      } else {
        console.log('Fetched users:', data); // Debug log
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching users');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
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

      setFormData({ name: '', description: '', price: '', image_url: '', stock: '', features: '' });
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
    setFormData({ name: '', description: '', price: '', image_url: '', stock: '', features: '' });
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
    // Add some visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'scale(1.02)';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the container, not just moving between child elements
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
    // Reset transform
    const target = e.currentTarget as HTMLElement;
    target.style.transform = '';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...additionalImages];
    const draggedItem = newImages[draggedIndex];
    
    // Remove the dragged item
    newImages.splice(draggedIndex, 1);
    // Insert it at the new position
    newImages.splice(dropIndex, 0, draggedItem);
    
    setAdditionalImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to access the admin dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage your products with AI-powered descriptions
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="capitalize">
              {userRole?.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg h-auto">
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-3 px-4 font-medium transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Products
            </TabsTrigger>
            {userRole === 'super_admin' && (
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-3 px-4 font-medium transition-all"
              >
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Manage Products</h2>
            <p className="text-muted-foreground">View and manage your product inventory</p>
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 w-full lg:w-auto">
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


        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {/* Desktop Actions */}
                    <div className="hidden md:flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(product.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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

                    {/* Mobile Actions */}
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Mobile Delete Dialog */}
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
          ))}
        </div>
          </TabsContent>

          {userRole === 'super_admin' && (
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    User Role Management
                  </CardTitle>
                  <CardDescription>
                    Manage user roles and permissions. Only super admins can modify user roles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            User ID: {user.user_id.slice(0, 8)}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}
                            className="capitalize"
                          >
                            {user.role.replace('_', ' ')}
                          </Badge>
                          {user.user_id !== user?.id && ( // Don't allow current user to change their own role
                            <Select
                              value={user.role}
                              onValueChange={(newRole: 'user' | 'admin' | 'super_admin') => 
                                updateUserRole(user.user_id, newRole)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
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