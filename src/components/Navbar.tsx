import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingBag, User, LogOut, ShoppingCart, Settings, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const isAdminUser = userRole === 'admin' || userRole === 'super_admin';

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl md:text-2xl font-bold text-gradient flex items-center pb-1.5 mr-10 hover:scale-105 transition-transform duration-200">
              TechStore
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <Link 
                to="/" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 flex items-center hover:scale-105 relative group"
              >
                Home
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </Link>
              <Link 
                to="/products" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 flex items-center hover:scale-105 relative group"
              >
                Products
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Cart Icon - Show for all users (demo and authenticated) */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:scale-110 transition-transform duration-200">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                {totalItems > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-xs gradient-primary border-0 text-white animate-bounce-gentle"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {/* Desktop User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                {isAdminUser && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-muted-foreground hidden lg:block">
                  Welcome, {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Demo Admin
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link 
                    to="/" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/products" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Products
                  </Link>
                  
                  {user ? (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Welcome, {user.email}
                        </p>
                        {isAdminUser && (
                          <Link 
                            to="/admin" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                          >
                            <Settings className="h-5 w-5 mr-3" />
                            Admin
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                          className="flex items-center text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2 w-full text-left"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="border-t pt-4 mt-4">
                      <Link 
                        to="/admin" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        <Settings className="h-5 w-5 mr-3" />
                        Demo Admin
                      </Link>
                      <Link 
                        to="/auth" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        <User className="h-5 w-5 mr-3" />
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;