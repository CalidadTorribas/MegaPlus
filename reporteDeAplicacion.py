#!/usr/bin/env python3
"""
🔍 Analizador de Proyecto Mega+ - Solo Informativo
Analiza la estructura del proyecto para identificar archivos/carpetas no utilizadas
"""

import os
import re
from pathlib import Path
from collections import defaultdict
import tkinter as tk
from tkinter import filedialog

class MegaAnalyzer:
    def __init__(self):
        self.project_root = None
        self.imports_found = set()
        self.files_analyzed = []
        self.empty_files = []
        self.unused_files = []
        self.file_sizes = {}
        
        # Extensiones de archivos a analizar para imports
        self.code_extensions = {'.tsx', '.ts', '.jsx', '.js', '.css', '.scss'}
        
        # Patrones de import comunes
        self.import_patterns = [
            r"import\s+.*?from\s+['\"](.+?)['\"]",  # ES6 imports
            r"import\s+['\"](.+?)['\"]",             # Import sin destructuring
            r"require\(['\"](.+?)['\"]\)",           # CommonJS require
            r"@import\s+['\"](.+?)['\"]",            # CSS imports
        ]
        
        # Carpetas que sabemos que están en uso (para comparar)
        self.known_used_paths = {
            'src/components/atoms/Button',
            'src/components/templates/MobileScreenLayout',
            'src/pages/SplashScreen.tsx',
            'src/pages/LoginScreen.tsx', 
            'src/pages/HubScreen.tsx',
            'src/pages/ProductosScreen.tsx',
            'src/lib/supabase.ts'
        }

    def select_project_directory(self):
        """Selecciona el directorio del proyecto"""
        root = tk.Tk()
        root.withdraw()  # Ocultar ventana principal
        
        directory = filedialog.askdirectory(
            title="Selecciona el directorio del proyecto Mega+"
        )
        
        if directory:
            self.project_root = Path(directory)
            return True
        return False

    def get_file_info(self, file_path):
        """Obtiene información básica del archivo"""
        try:
            stat = file_path.stat()
            size = stat.st_size
            
            # Intentar leer contenido para ver si está vacío
            content = ""
            char_count = 0
            is_empty = False
            
            if file_path.suffix in self.code_extensions:
                try:
                    content = file_path.read_text(encoding='utf-8')
                    char_count = len(content.strip())
                    is_empty = char_count == 0 or content.strip() == ""
                except:
                    char_count = "No legible"
            
            return {
                'size': size,
                'char_count': char_count,
                'is_empty': is_empty,
                'content': content
            }
        except Exception as e:
            return {
                'size': 0,
                'char_count': f"Error: {e}",
                'is_empty': True,
                'content': ""
            }

    def find_imports_in_file(self, file_path, content):
        """Encuentra todos los imports en un archivo"""
        imports = set()
        
        for pattern in self.import_patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            for match in matches:
                # Limpiar y normalizar paths
                clean_path = match.strip()
                
                # Resolver paths relativos a absolutos del proyecto
                if clean_path.startswith('./') or clean_path.startswith('../'):
                    try:
                        resolved = (file_path.parent / clean_path).resolve()
                        relative_to_project = resolved.relative_to(self.project_root)
                        imports.add(str(relative_to_project))
                    except:
                        pass
                elif clean_path.startswith('@/'):
                    # Alias de src/
                    clean_path = clean_path.replace('@/', 'src/')
                    imports.add(clean_path)
                elif not clean_path.startswith('.') and not '/' in clean_path:
                    # Podría ser un path interno del proyecto
                    imports.add(clean_path)
        
        return imports

    def analyze_directory_structure(self):
        """Analiza toda la estructura del proyecto"""
        if not self.project_root:
            return
        
        print(f"🔍 Analizando proyecto en: {self.project_root}")
        print("=" * 80)
        
        # Carpetas a ignorar
        ignore_dirs = {
            'node_modules', '.git', 'dist', 'build', '.next', 
            '.vscode', '__pycache__', '.pytest_cache'
        }
        
        all_files = []
        empty_files = []
        small_files = []
        large_unused_dirs = []
        
        # Recorrer recursivamente
        for root, dirs, files in os.walk(self.project_root):
            # Filtrar directorios ignorados
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            current_path = Path(root)
            relative_path = current_path.relative_to(self.project_root)
            
            # Analizar archivos en esta carpeta
            folder_files = []
            folder_empty_files = []
            
            for file in files:
                file_path = current_path / file
                relative_file_path = file_path.relative_to(self.project_root)
                
                info = self.get_file_info(file_path)
                
                file_data = {
                    'path': relative_file_path,
                    'name': file,
                    'size': info['size'],
                    'char_count': info['char_count'],
                    'is_empty': info['is_empty'],
                    'extension': file_path.suffix
                }
                
                all_files.append(file_data)
                folder_files.append(file_data)
                
                # Analizar imports si es archivo de código
                if file_path.suffix in self.code_extensions and info['content']:
                    imports = self.find_imports_in_file(file_path, info['content'])
                    self.imports_found.update(imports)
                
                # Detectar archivos vacíos o muy pequeños
                if info['is_empty'] or (isinstance(info['char_count'], int) and info['char_count'] < 50):
                    empty_files.append(file_data)
                    folder_empty_files.append(file_data)
            
            # Mostrar información de la carpeta actual
            if str(relative_path) != '.':
                total_size = sum(f['size'] for f in folder_files)
                empty_count = len(folder_empty_files)
                
                print(f"\n📁 {relative_path}/")
                print(f"   📊 {len(folder_files)} archivos | {total_size:,} bytes total")
                
                if empty_count > 0:
                    print(f"   ⚠️  {empty_count} archivos vacíos/muy pequeños:")
                    for empty_file in folder_empty_files:
                        print(f"      - {empty_file['name']} ({empty_file['char_count']} chars)")
                
                # Detectar carpetas sospechosas de no uso
                if len(folder_files) > 3 and empty_count == len(folder_files):
                    print(f"   🚨 SOSPECHOSA: Todos los archivos están vacíos")
                    large_unused_dirs.append(str(relative_path))
                
                elif len(folder_files) > 0:
                    # Mostrar algunos archivos como muestra
                    print(f"   📄 Archivos:")
                    for file_data in folder_files[:3]:  # Mostrar solo los primeros 3
                        status = "vacío" if file_data['is_empty'] else f"{file_data['char_count']} chars"
                        print(f"      - {file_data['name']} ({file_data['size']} bytes, {status})")
                    
                    if len(folder_files) > 3:
                        print(f"      ... y {len(folder_files) - 3} más")
        
        return {
            'all_files': all_files,
            'empty_files': empty_files,
            'suspicious_dirs': large_unused_dirs
        }

    def generate_usage_report(self, analysis_data):
        """Genera reporte de uso basado en imports encontrados"""
        print("\n" + "=" * 80)
        print("📊 REPORTE DE USO DE ARCHIVOS")
        print("=" * 80)
        
        all_files = analysis_data['all_files']
        empty_files = analysis_data['empty_files']
        suspicious_dirs = analysis_data['suspicious_dirs']
        
        # Estadísticas generales
        total_files = len(all_files)
        empty_count = len(empty_files)
        code_files = [f for f in all_files if f['extension'] in self.code_extensions]
        
        print(f"\n📈 ESTADÍSTICAS GENERALES:")
        print(f"   • Total de archivos: {total_files}")
        print(f"   • Archivos de código: {len(code_files)}")
        print(f"   • Archivos vacíos/pequeños: {empty_count}")
        print(f"   • Carpetas sospechosas: {len(suspicious_dirs)}")
        
        # Archivos vacíos por categoría
        if empty_files:
            print(f"\n⚠️  ARCHIVOS VACÍOS O MUY PEQUEÑOS ({len(empty_files)}):")
            by_extension = defaultdict(list)
            for empty_file in empty_files:
                by_extension[empty_file['extension']].append(empty_file)
            
            for ext, files in by_extension.items():
                print(f"   📁 {ext or 'Sin extensión'} ({len(files)} archivos):")
                for file in files[:5]:  # Mostrar solo 5 por categoría
                    print(f"      - {file['path']}")
                if len(files) > 5:
                    print(f"      ... y {len(files) - 5} más")
        
        # Carpetas sospechosas
        if suspicious_dirs:
            print(f"\n🚨 CARPETAS SOSPECHOSAS DE NO USO:")
            for dir_path in suspicious_dirs:
                print(f"   📁 {dir_path}/ (todos los archivos están vacíos)")
        
        # Análisis de uso conocido vs real
        print(f"\n✅ ARCHIVOS QUE SABEMOS QUE SE USAN:")
        for known_path in sorted(self.known_used_paths):
            full_path = self.project_root / known_path
            if full_path.exists():
                print(f"   ✓ {known_path}")
            else:
                print(f"   ✗ {known_path} (NO EXISTE)")

    def run_analysis(self):
        """Ejecuta el análisis completo"""
        print("🚀 Analizador de Proyecto Mega+ - Solo Informativo")
        print("=" * 50)
        
        if not self.select_project_directory():
            print("❌ No se seleccionó directorio. Saliendo...")
            return
        
        try:
            analysis_data = self.analyze_directory_structure()
            self.generate_usage_report(analysis_data)
            
            print("\n" + "=" * 80)
            print("✅ ANÁLISIS COMPLETADO")
            print("=" * 80)
            print("\n🔍 Revisa el reporte anterior para identificar:")
            print("   • Archivos vacíos que pueden eliminarse")
            print("   • Carpetas con todos los archivos vacíos")
            print("   • Estructura real vs estructura teórica")
            print("\n💡 Este análisis es solo informativo - no se eliminó nada.")
            
        except Exception as e:
            print(f"❌ Error durante el análisis: {e}")

def main():
    analyzer = MegaAnalyzer()
    analyzer.run_analysis()
    
    input("\nPresiona Enter para salir...")

if __name__ == "__main__":
    main()