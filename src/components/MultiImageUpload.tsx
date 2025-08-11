import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnter?: (e: React.DragEvent, index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  draggedIndex?: number | null;
  dragOverIndex?: number | null;
  onImageClick?: (imageUrl: string) => void;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDragEnd,
  onDrop,
  draggedIndex,
  dragOverIndex,
  onImageClick
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    onImagesChange(newImages);
  };

  const addImage = () => {
    onImagesChange([...images, '']);
  };

  const removeImage = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingIndex(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      updateImage(index, publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingIndex(null);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Additional Images</Label>
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Image
        </Button>
      </div>
      <div className="space-y-2">
        {images.map((image, index) => (
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
            onDragStart={(e) => onDragStart?.(e, index)}
            onDragEnter={(e) => onDragEnter?.(e, index)}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={(e) => onDrop?.(e, index)}
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
            <div className="flex-1">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="url" className="text-xs px-2">
                    <Link className="h-3 w-3 mr-1" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs px-2">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={image}
                      onChange={(e) => updateImage(index, e.target.value)}
                      placeholder={`https://example.com/image${index + 1}.jpg`}
                      className="flex-1"
                    />
                    {image && (
                      <img
                        src={image}
                        alt={`Additional image ${index + 1} preview`}
                        className="h-10 w-16 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onImageClick?.(image)}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={uploadingIndex === index}
                      className="flex-1"
                    />
                    {image && (
                      <img
                        src={image}
                        alt={`Additional image ${index + 1} preview`}
                        className="h-10 w-16 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onImageClick?.(image)}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  {uploadingIndex === index && (
                    <p className="text-xs text-muted-foreground mt-1">Uploading image...</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            {images.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeImage(index)}
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
  );
};