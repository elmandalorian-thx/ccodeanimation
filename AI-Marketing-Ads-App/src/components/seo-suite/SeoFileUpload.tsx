import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, BarChart, Globe, FileCode, X, CheckCircle2 } from 'lucide-react';

interface SeoFileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

export function SeoFileUpload({ onFilesUploaded }: SeoFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileGuidance = [
    {
      icon: FileSpreadsheet,
      title: 'Google Search Console Export',
      description: 'Performance report with queries and pages',
      howTo: 'Go to Search Console > Performance > Export > Download Excel',
      benefit: 'Identify keyword gaps and opportunities',
      color: 'cyan'
    },
    {
      icon: BarChart,
      title: 'Google Analytics Report',
      description: 'Traffic sources and landing pages',
      howTo: 'Analytics > Reports > Traffic acquisition > Export',
      benefit: 'Understand current SEO performance',
      color: 'green'
    },
    {
      icon: Globe,
      title: 'Sitemap XML',
      description: "Your website's sitemap.xml file",
      howTo: 'Usually at yourdomain.com/sitemap.xml',
      benefit: 'Analyze site structure and indexation',
      color: 'purple'
    },
    {
      icon: FileCode,
      title: 'Existing Schema Files',
      description: 'Current JSON-LD or structured data',
      howTo: "View page source > Search for 'application/ld+json'",
      benefit: 'Audit and improve existing markup',
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

  const colorClasses: Record<string, string> = {
    cyan: 'border-cyan-500/30 bg-cyan-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
    orange: 'border-orange-500/30 bg-orange-500/10'
  };

  const iconColors: Record<string, string> = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400'
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          Upload Files for Deep Analysis
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload supporting files to enhance your SEO analysis
        </p>
      </div>

      {/* File Type Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fileGuidance.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${colorClasses[item.color]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[item.color]}`} />
                <div>
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="text-xs space-y-1">
                    <p className="text-slate-400">{item.howTo}</p>
                    <p className="text-green-400">{item.benefit}</p>
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
            ? 'border-purple-500 bg-purple-500/10'
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
        <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-purple-400' : 'text-slate-500'}`} />
        <p className="font-medium text-slate-300 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-muted-foreground">
          Supports CSV, XLSX, XML, JSON files
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
