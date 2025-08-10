import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!user) {
      // Load demo cart from localStorage
      const demoCart = localStorage.getItem('demo-cart');
      if (demoCart) {
        try {
          const demoItems = JSON.parse(demoCart);
          // Fetch product details for demo items
          const productIds = demoItems.map((item: any) => item.product_id);
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price, image_url, stock')
            .in('id', productIds);
          
          if (products) {
            const formattedItems = demoItems.map((item: any) => {
              const product = products.find(p => p.id === item.product_id);
              return {
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                products: product
              };
            }).filter((item: any) => item.products);
            setItems(formattedItems);
          }
        } catch (error) {
          console.error('Error loading demo cart:', error);
          setItems([]);
        }
      } else {
        setItems([]);
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      // Demo mode - use localStorage
      try {
        const demoCart = JSON.parse(localStorage.getItem('demo-cart') || '[]');
        const existingItemIndex = demoCart.findIndex((item: any) => item.product_id === productId);
        
        if (existingItemIndex >= 0) {
          demoCart[existingItemIndex].quantity += quantity;
        } else {
          demoCart.push({
            id: `demo-${Date.now()}-${Math.random()}`,
            product_id: productId,
            quantity,
          });
        }
        
        localStorage.setItem('demo-cart', JSON.stringify(demoCart));
        toast({
          title: "Added to cart (Demo Mode)",
          description: "Item has been added to your demo cart",
        });
        await fetchCartItems();
      } catch (error) {
        console.error('Error adding to demo cart:', error);
      }
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = items.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update existing item quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });

        if (error) {
          console.error('Error adding to cart:', error);
          toast({
            title: "Error",
            description: "Failed to add item to cart",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Added to cart",
            description: "Item has been added to your cart",
          });
          await fetchCartItems();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      if (!user) {
        // Demo mode - update localStorage
        const demoCart = JSON.parse(localStorage.getItem('demo-cart') || '[]');
        const itemIndex = demoCart.findIndex((item: any) => item.id === itemId);
        if (itemIndex >= 0) {
          demoCart[itemIndex].quantity = quantity;
          localStorage.setItem('demo-cart', JSON.stringify(demoCart));
          await fetchCartItems();
        }
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating quantity:', error);
        toast({
          title: "Error",
          description: "Failed to update quantity",
          variant: "destructive",
        });
      } else {
        await fetchCartItems();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      if (!user) {
        // Demo mode - update localStorage
        const demoCart = JSON.parse(localStorage.getItem('demo-cart') || '[]');
        const updatedCart = demoCart.filter((item: any) => item.id !== itemId);
        localStorage.setItem('demo-cart', JSON.stringify(updatedCart));
        toast({
          title: "Item removed (Demo Mode)",
          description: "Item has been removed from your demo cart",
        });
        await fetchCartItems();
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from cart:', error);
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart",
        });
        await fetchCartItems();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const clearCart = async () => {
    if (!user) {
      // Demo mode - clear localStorage
      localStorage.removeItem('demo-cart');
      setItems([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const refreshCart = async () => {
    await fetchCartItems();
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};