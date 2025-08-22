import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Truck, Shield, Zap, Award, Users, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
  is_featured?: boolean;
}

const Index = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(3);

      if (error) throw error;
      setFeaturedProducts((data || []).slice(0, 3));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative gradient-hero py-20 lg:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left lg:text-left text-center animate-slide-up">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
                Welcome to TechStore
              </h1>
              <p className="text-xl lg:text-2xl text-foreground/80 mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
                Discover the latest in technology with our curated collection of premium gadgets and accessories
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{animationDelay: '0.4s'}}>
                <Link to="/products">
                  <Button variant="premium" size="lg" className="w-full sm:w-auto">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Shop Now
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign Up for Deals
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end animate-scale-in" style={{animationDelay: '0.6s'}}>
              <div className="relative">
                <div className="w-80 h-80 gradient-primary rounded-3xl opacity-20 blur-2xl animate-glow-pulse"></div>
                <div className="absolute inset-8 bg-card/80 backdrop-blur-sm rounded-2xl shadow-elegant flex items-center justify-center">
                  <div className="text-6xl animate-bounce-gentle">🚀</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Why Choose TechStore?</h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              We're committed to bringing you the best technology products with exceptional service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center gradient-card shadow-card hover-lift group animate-fade-in border-0" style={{animationDelay: '0.1s'}}>
              <CardHeader>
                <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every product is carefully selected and tested to ensure the highest quality standards
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center gradient-card shadow-card hover-lift group animate-fade-in border-0" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">Fast Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Free shipping on orders over $50 with lightning-fast delivery to your doorstep
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center gradient-card shadow-card hover-lift group animate-fade-in border-0" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">Secure Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your personal information and payments are protected with enterprise-grade security
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Featured Products</h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Handpicked selections from our premium tech collection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="gradient-card shadow-card hover-lift border-0 animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardHeader>
                </Card>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <Card key={product.id} className="gradient-card shadow-card hover-lift group border-0 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 right-3 gradient-primary text-white border-0">Featured</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">{product.name}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="ml-1 text-sm text-foreground/70">4.9</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/products/${product.id}`}>
                      <Button className="w-full group-hover:shadow-glow transition-all">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-foreground/70">No featured products available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Link to="/products">
              <Button variant="outline" size="lg" className="group">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-foreground/70">Happy Customers</p>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-foreground/70">Uptime</p>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-foreground/70">Support</p>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-foreground/70">Products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Shop by Category</h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Find exactly what you're looking for in our organized categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Smartphones', icon: '📱', items: '200+' },
              { name: 'Laptops', icon: '💻', items: '150+' },
              { name: 'Audio', icon: '🎧', items: '300+' },
              { name: 'Gaming', icon: '🎮', items: '180+' },
              { name: 'Wearables', icon: '⌚', items: '120+' },
              { name: 'Accessories', icon: '🔌', items: '400+' },
              { name: 'Smart Home', icon: '🏠', items: '90+' },
              { name: 'Cameras', icon: '📸', items: '80+' }
            ].map((category, index) => (
              <Card key={category.name} className="text-center gradient-card shadow-card hover-lift group cursor-pointer border-0 animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-foreground/60">{category.items} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Why Trust TechStore?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Secure Payments', desc: 'SSL encrypted checkout' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping over $50' },
              { icon: Award, title: 'Warranty', desc: '1-year manufacturer warranty' },
              { icon: Users, title: 'Expert Support', desc: '24/7 customer service' }
            ].map((item, index) => (
              <div key={item.title} className="flex flex-col items-center text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-foreground/70 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">What Our Customers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Tech Enthusiast',
                content: 'Amazing quality products and lightning-fast shipping. TechStore has become my go-to for all tech needs!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Developer',
                content: 'The customer service is exceptional. They helped me choose the perfect laptop for my development work.',
                rating: 5
              },
              {
                name: 'Emily Davis',
                role: 'Content Creator',
                content: 'Great prices and authentic products. The warranty support gave me peace of mind with my purchase.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={testimonial.name} className="gradient-card shadow-card hover-lift border-0 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-foreground/60">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">Ready to Start Shopping?</h2>
          <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Browse our extensive collection of tech products and find exactly what you need
          </p>
          <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Link to="/products">
              <Button variant="premium" size="lg" className="text-lg px-8 py-4">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
