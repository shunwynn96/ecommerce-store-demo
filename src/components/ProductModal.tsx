import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Minus, Plus, X, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface ProductModalProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductModal = ({ productId, open, onOpenChange }: ProductModalProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (productId && open) {
      fetchProduct();
    }
  }, [productId, open]);

  useEffect(() => {
    if (product && open) {
      fetchRecommendations();
    }
  }, [product, open]);

  const fetchProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } else if (!data) {
        toast({
          title: "Product not found",
          description: "The product you're looking for doesn't exist",
          variant: "destructive",
        });
        onOpenChange(false);
      } else {
        const productData = {
          ...data,
          images: Array.isArray(data.images) ? data.images.filter((img): img is string => typeof img === 'string') : []
        } as Product;
        setProduct(productData);
        setQuantity(1);
        setCurrentImageIndex(-1);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!product) return;
    
    setLoadingRecommendations(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-product-recommendations', {
        body: {
          currentProductId: product.id,
          currentProductName: product.name,
        },
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
      } else if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, quantity);
    }
  };

  const ProductSkeleton = () => (
    <div className="space-y-4">
      <div className="aspect-square skeleton rounded-lg"></div>
      <div className="space-y-2">
        <div className="skeleton h-8 w-3/4"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-2/3"></div>
        <div className="skeleton h-6 w-24"></div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-gradient">
                {product?.name || 'Product Details'}
              </DialogTitle>
            </DialogHeader>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            ) : product ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-lg shadow-elegant">
                      <img
                        src={currentImageIndex === -1 ? product.image_url : product.images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    
                    {product.images && product.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                          onClick={() => setCurrentImageIndex(-1)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                            currentImageIndex === -1 ? 'border-primary shadow-glow' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={product.image_url}
                            alt={`${product.name} main`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                              currentImageIndex === index ? 'border-primary shadow-glow' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold text-gradient">
                        ${product.price}
                      </span>
                      {product.stock <= 10 && (
                        <Badge 
                          variant={product.stock > 0 ? (product.stock <= 5 ? "destructive" : "secondary") : "secondary"}
                          className={`${product.stock > 0 && product.stock <= 5 ? "animate-pulse" : ""} text-xs`}
                        >
                          {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} left`}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label htmlFor="quantity" className="font-semibold">Quantity:</label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="hover:scale-110 transition-transform"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            disabled={quantity >= product.stock}
                            className="hover:scale-110 transition-transform"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button
                          onClick={handleAddToCart}
                          disabled={product.stock === 0}
                          className="flex-1 hover:scale-105 transition-transform gradient-primary"
                          size="lg"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                        <Link to={`/products/${product.id}`} onClick={() => onOpenChange(false)}>
                          <Button variant="outline" size="lg" className="hover:scale-105 transition-transform">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Full Details
                          </Button>
                        </Link>
                      </div>
                      
                      {!user && (
                        <div className="p-4 bg-secondary/50 rounded-lg border">
                          <p className="text-sm text-muted-foreground mb-2">
                            Sign in for a personalized experience
                          </p>
                          <Link to="/auth" onClick={() => onOpenChange(false)}>
                            <Button variant="outline" size="sm">
                              Sign In
                            </Button>
                          </Link>
                        </div>
                      )}
                      
                      {product.stock === 0 && (
                        <p className="text-destructive text-sm font-medium">This item is currently out of stock</p>
                      )}
                      
                      <div className="p-4 bg-gradient-hero rounded-lg border">
                        <p className="text-sm font-medium flex items-center">
                          🚚 Free shipping on orders over $50
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                {recommendations.length > 0 && (
                  <div className="border-t pt-8">
                    <h3 className="text-2xl font-bold mb-6 text-center">You may also like</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations.slice(0, 3).map((rec) => (
                        <Card 
                          key={rec.id} 
                          className="cursor-pointer hover:shadow-elegant transition-all duration-300 hover-lift"
                          onClick={() => {
                            setProduct(null);
                            fetchProduct();
                          }}
                        >
                          <CardHeader className="p-0">
                            <div className="aspect-square overflow-hidden rounded-t-lg">
                              <img
                                src={rec.image_url}
                                alt={rec.name}
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <CardTitle className="text-sm mb-2 line-clamp-2">
                              {rec.name}
                            </CardTitle>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gradient">
                                ${rec.price}
                              </span>
                              <Badge variant={rec.stock > 0 ? "default" : "secondary"} className="text-xs">
                                {rec.stock > 0 ? 'In Stock' : 'Out'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {loadingRecommendations && (
                      <div className="text-center py-4">
                        <div className="text-muted-foreground">Loading AI recommendations...</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg">Product not found</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;