import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Globe, FileSpreadsheet, Image, FileJson, X, CheckCircle2 } from 'lucide-react';

interface GeoFileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

export function GeoFileUpload({ onFilesUploaded }: GeoFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileTypes = [
    {
      icon: Globe,
      title: 'Website Export',
      description: 'HTML export of your key pages for deep content analysis',
      formats: '.html, .htm',
      benefit: 'Analyze full page structure and hidden content',
      color: 'cyan'
    },
    {
      icon: FileSpreadsheet,
      title: 'Search Console Data',
      description: 'Export from Google Search Console (queries, pages)',
      formats: '.csv, .xlsx',
      benefit: 'Identify query gaps and ranking opportunities',
      color: 'green'
    },
    {
      icon: Image,
      title: 'Competitor Screenshots',
      description: 'Screenshots of competitor AI responses',
      formats: '.png, .jpg',
      benefit: 'Visual comparison of AI visibility',
      color: 'purple'
    },
    {
      icon: FileJson,
      title: 'Schema Markup',
      description: 'Your current JSON-LD or microdata files',
      formats: '.json, .jsonld',
      benefit: 'Audit existing structured data',
      color: 'orange'
    }
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    onFilesUploaded([...files, ...droppedFiles]);
  }, [files, onFilesUploaded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      onFilesUploaded([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const colorClasses = {
    cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    green: 'border-green-500/30 bg-green-500/10 text-green-400',
    purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    orange: 'border-orange-500/30 bg-orange-500/10 text-orange-400'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800/50 to-cyan-900/20 rounded-xl p-6 border border-cyan-500/30">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Supporting Files
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload files to enhance your GEO analysis with deeper insights
        </p>
      </div>

      {/* File Type Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fileTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${colorClasses[type.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">{type.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-slate-800 rounded">{type.formats}</span>
                    <span className="text-green-400">{type.benefit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative p-8 border-2 border-dashed rounded-xl text-center transition-all
          ${isDragging
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
          }
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-cyan-400' : 'text-slate-500'}`} />
        <p className="font-medium text-slate-300 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-muted-foreground">
          Supports HTML, CSV, XLSX, JSON, PNG, JPG
        </p>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-300">Uploaded Files ({files.length})</h4>
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
