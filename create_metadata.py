import os
import json

base_path = '/Users/kevinpimenta/Desktop/uka bw/public/project photos/photos and video'

# Predefined distribution of the 25 tower slots
TOWER_SLOTS = [
    {"title": "Parnaka Residency", "folder": "Parnaka", "cat": "Residential", "side": "L", "indices": (0, [1, 2])},
    {"title": "Chandresh Palace", "folder": "chandresh ", "cat": "Residential", "side": "R", "indices": (0, [1, 2])},
    {"title": "Arunoday Complex", "folder": "Arunoday", "cat": "Residential", "side": "L", "indices": (0, [1, 2])},
    {"title": "Gurudarshan Residency", "folder": "Gurudarshan", "cat": "Residential", "side": "R", "indices": (0, [1, 2])},
    {"title": "Lodha Veer Savarkar", "folder": "Lodha veer savarkar", "cat": "Residential", "side": "L", "indices": (0, [1, 2, 3])},
    {"title": "Satyasaurabh Heights", "folder": "Satyasaurabh", "cat": "Residential", "side": "R", "indices": (0, [1, 2])},
    {"title": "Cheda Girnar", "folder": "cheda girnar", "cat": "Residential", "side": "L", "indices": (0, [1, 2])},
    {"title": "Happy Villa", "folder": "happy villa", "cat": "Residential", "side": "R", "indices": (0, [1, 2])},
    {"title": "IDBI Commercial Hub", "folder": "idbi", "cat": "Commercial", "side": "L", "indices": (0, [1, 2])},
    {"title": "Karari Heights", "folder": "karari heights (Yamuna Satkar)", "cat": "Residential", "side": "R", "indices": (0, [1, 2, 3])},
    {"title": "Mulgaon Residency", "folder": "mulgaon", "cat": "Residential", "side": "L", "indices": (0, [1, 2])},
    {"title": "New Narmada Satyam", "folder": "new narmada satyam", "cat": "Residential", "side": "R", "indices": (0, [1, 2, 3])},
    {"title": "Shani Mandir Plaza", "folder": "shani mandir", "cat": "Commercial", "side": "L", "indices": (0, [1, 2, 3, 4])},
    {"title": "Vishal View", "folder": "vishal view", "cat": "Residential", "side": "R", "indices": (0, [1, 2, 3, 4])},
    {"title": "Yashawant Kasturi", "folder": "yashawant kasturi", "cat": "Residential", "side": "L", "indices": (0, [1, 2, 3, 5])},
    {"title": "Narangi Residency", "folder": "Renders Images/naringi 2", "cat": "Residential", "side": "R", "indices": (0, [1, 2])},
    {"title": "Chandresh Heights", "folder": "chandresh ", "cat": "Residential", "side": "L", "indices": (1, [2, 0]), "isComingSoon": True},
    {"title": "New Narmada Satyam", "folder": "new narmada satyam", "cat": "Residential", "side": "R", "indices": (4, [5, 6]), "isComingSoon": True},
    {"title": "IDBI Corporate Suites", "folder": "idbi", "cat": "Corporate", "side": "L", "indices": (3, [4, 1]), "isComingSoon": True},
    {"title": "Yashawant Kasturi", "folder": "yashawant kasturi", "cat": "Residential", "side": "R", "indices": (4, [6, 7, 8]), "isComingSoon": True},
    {"title": "Parnaka Plaza", "folder": "Parnaka", "cat": "Residential", "side": "L", "indices": (6, [7, 8, 9]), "isComingSoon": True},
    {"title": "Arunoday", "folder": "Arunoday", "cat": "Residential", "side": "R", "indices": (1, [2, 0]), "isComingSoon": True},
    {"title": "Mulgaon", "folder": "mulgaon", "cat": "Residential", "side": "L", "indices": (3, [1, 2]), "isComingSoon": True},
    {"title": "Happy Villa", "folder": "happy villa", "cat": "Residential", "side": "R", "indices": (3, [1, 2]), "isComingSoon": True},
    {"title": "Gurudarshan", "folder": "Gurudarshan", "cat": "Residential", "side": "L", "indices": (1, [2, 0]), "isComingSoon": True}
]

def make_slug(title):
    return title.lower().replace(" (", "-").replace(")", "").replace(" ", "-").replace("&", "and")

def scan_folder_images(folder_name):
    path = os.path.join(base_path, folder_name)
    imgs = []
    if os.path.exists(path):
        for root, dirs, files in os.walk(path):
            if "color option" in root:
                continue
            for f in sorted(files):
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    if not f.startswith('.') and 'thumb' not in f.lower():
                        rel = os.path.relpath(os.path.join(root, f), '/Users/kevinpimenta/Desktop/uka bw/public')
                        imgs.append("/" + rel)
    return imgs

def generate_typescript():
    projects = []
    for idx, slot in enumerate(TOWER_SLOTS):
        folder = slot["folder"]
        imgs = scan_folder_images(folder)
        
        if not imgs:
            print(f"Warning: No images found for {folder}")
            continue
            
        hero_idx, gall_indices = slot["indices"]
        
        # Safe bounds matching
        hero_img = imgs[hero_idx % len(imgs)]
        gallery = [imgs[i % len(imgs)] for i in gall_indices]
        
        slug = make_slug(slot["title"])
        
        project_obj = {
            "id": idx + 1,
            "title": slot["title"],
            "cat": slot["cat"],
            "slug": slug,
            "side": slot["side"],
            "heroImage": hero_img,
            "gallery": gallery,
            "images": imgs,
            "location": "Mumbai, India",
            "year": "2024",
            "area": "15,000 sq.ft",
            "status": "Completed"
        }
        
        if slot.get("isComingSoon"):
            project_obj["isComingSoon"] = True
            
        projects.append(project_obj)
        
    ts_content = f"""// Generated by create_metadata.py. Do not edit manually.
export interface Project {{
  id: number;
  title: string;
  cat: string;
  slug: string;
  side: "L" | "R";
  heroImage: string;
  gallery: string[];
  images: string[];
  location: string;
  year: string;
  area: string;
  status: string;
  isComingSoon?: boolean;
}}

export const PROJECTS_DATA: Project[] = {json.dumps(projects, indent=2)};
"""
    
    out_file = '/Users/kevinpimenta/Desktop/uka bw/src/lib/projectsData.ts'
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, 'w') as f:
        f.write(ts_content)
        
    print(f"Generated projectsData.ts successfully with {len(projects)} entries!")

if __name__ == '__main__':
    generate_typescript()
