import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderCreated, setOrderCreated] = useState(false);
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const createOrder = async () => {
      if (!sessionId || !user || orderCreated) return;

      try {
        // Create order record in database
        const { error } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: 0, // This should be populated with actual amount from Stripe
            status: 'completed',
            stripe_session_id: sessionId,
          });

        if (error) {
          console.error('Error creating order:', error);
          toast({
            title: "Warning",
            description: "Payment successful but failed to record order",
            variant: "destructive",
          });
        } else {
          // Clear the cart after successful order creation
          await clearCart();
          setOrderCreated(true);
          toast({
            title: "Order Confirmed!",
            description: "Your payment was successful and order has been created",
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    createOrder();
  }, [sessionId, user, orderCreated, clearCart, toast]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been confirmed and will be processed shortly.
              </p>
              
              {sessionId && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">Order Reference:</p>
                  <p className="text-xs text-muted-foreground break-all">{sessionId}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Link to="/products" className="block">
                  <Button className="w-full">
                    <Package className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
                
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;