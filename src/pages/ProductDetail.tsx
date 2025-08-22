import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string[];
  stock: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1); // -1 means main image
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRecommendations();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
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
        navigate('/products');
      } else {
        // Transform the data to handle images array properly
        const productData = {
          ...data,
          images: Array.isArray(data.images) ? data.images.filter((img): img is string => typeof img === 'string') : []
        } as Product;
        setProduct(productData);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={currentImageIndex === -1 ? product.image_url : product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {/* Main image thumbnail */}
              <button
                onClick={() => setCurrentImageIndex(-1)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  currentImageIndex === -1 ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img
                  src={product.image_url}
                  alt={`${product.name} main`}
                  className="w-full h-full object-cover"
                />
              </button>
              
              {/* Additional images thumbnails */}
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index ? 'border-primary' : 'border-transparent'
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

        <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">
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
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                {!user && (
                  <Link to="/auth">
                    <Button variant="outline" size="lg">
                      Sign In for Full Features
                    </Button>
                  </Link>
                )}
              </div>
              
              {product.stock === 0 && (
                <p className="text-destructive text-sm">This item is currently out of stock</p>
              )}
              
              <p className="text-sm text-muted-foreground">
                Free shipping on orders over $50
              </p>
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You may also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link key={rec.id} to={`/products/${rec.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={rec.image_url}
                          alt={rec.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {rec.name}
                      </CardTitle>
                      <CardDescription className="mb-3 line-clamp-2">
                        {rec.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          ${rec.price}
                        </span>
                        {rec.stock <= 10 && (
                          <Badge 
                            variant={rec.stock > 0 ? (rec.stock <= 5 ? "destructive" : "secondary") : "secondary"}
                            className={`${rec.stock > 0 && rec.stock <= 5 ? "animate-pulse" : ""} text-xs`}
                          >
                            {rec.stock === 0 ? 'Out of stock' : `Only ${rec.stock} left`}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {loadingRecommendations && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading AI recommendations...</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;