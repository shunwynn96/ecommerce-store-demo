import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Star, Truck, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left lg:text-left text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome to TechStore
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
                Discover the latest in technology with our curated collection of premium gadgets and accessories
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Button>
              </Link>
              {!user && (
                <Link to="/auth" className="ml-4">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign Up for Deals
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose TechStore?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're committed to bringing you the best technology products with exceptional service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every product is carefully selected and tested to ensure the highest quality standards
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fast Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Free shipping on orders over $50 with lightning-fast delivery to your doorstep
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your personal information and payments are protected with enterprise-grade security
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Browse our extensive collection of tech products and find exactly what you need
          </p>
          <Link to="/products">
            <Button size="lg">
              Explore Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
