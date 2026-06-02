import os
from PIL import Image

def compress_images_inplace():
    base_path = '/Users/kevinpimenta/Desktop/uka bw/public/project photos/photos and video'
    count = 0
    total_saved = 0
    
    for root, dirs, files in os.walk(base_path):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                if f.startswith('.'):
                    continue
                file_path = os.path.join(root, f)
                original_size = os.path.getsize(file_path)
                
                # Only compress if it is larger than 150KB to avoid wasting time on already small files
                if original_size < 150 * 1024:
                    continue
                
                try:
                    with Image.open(file_path) as img:
                        # Convert RGBA/P to RGB for JPEG compatibility
                        if img.mode in ('RGBA', 'LA', 'P'):
                            img = img.convert('RGB')
                        
                        # Downscale only if it is wider than 2000px
                        width, height = img.size
                        if width > 2000:
                            ratio = 2000.0 / width
                            new_height = int(height * ratio)
                            img = img.resize((2000, new_height), Image.Resampling.LANCZOS)
                            print(f"Resized {f} from {width}x{height} to 2000x{new_height}")
                        
                        # Save in-place with high quality compression
                        img.save(file_path, 'JPEG', quality=83, optimize=True)
                        
                    new_size = os.path.getsize(file_path)
                    saved = original_size - new_size
                    total_saved += saved
                    count += 1
                    reduction = (saved / original_size) * 100
                    print(f"Compressed {f}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB (-{reduction:.1f}%)")
                except Exception as e:
                    print(f"Error compressing {f}: {e}")
                    
    print("\n==============================================")
    print(f"Successfully compressed {count} images in-place!")
    print(f"Total space saved: {total_saved/1024/1024:.2f} MB")
    print("==============================================")

if __name__ == '__main__':
    compress_images_inplace()
