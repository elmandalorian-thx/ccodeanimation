import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Building2, FileText, HelpCircle, Briefcase, Stethoscope, Calendar, Copy, Check, Wand2 } from 'lucide-react';
import { useBrandStore } from '../../stores/brandStore';

type SchemaType = 'LocalBusiness' | 'Product' | 'Organization' | 'Article' | 'FAQPage' | 'Service' | 'MedicalBusiness' | 'Event';

interface SchemaTypeConfig {
  type: SchemaType;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fields: string[];
}

const schemaTypes: SchemaTypeConfig[] = [
  { type: 'LocalBusiness', icon: Store, description: 'For local businesses, clinics, stores', fields: ['name', 'address', 'phone', 'hours'] },
  { type: 'Product', icon: Package, description: 'For product pages with reviews', fields: ['name', 'description', 'price', 'availability'] },
  { type: 'Organization', icon: Building2, description: 'For company pages', fields: ['name', 'logo', 'url', 'social'] },
  { type: 'Article', icon: FileText, description: 'For blog posts and articles', fields: ['headline', 'author', 'datePublished', 'image'] },
  { type: 'FAQPage', icon: HelpCircle, description: 'For FAQ sections', fields: ['questions'] },
  { type: 'Service', icon: Briefcase, description: 'For service offerings', fields: ['name', 'description', 'provider'] },
  { type: 'MedicalBusiness', icon: Stethoscope, description: 'For clinics and practices', fields: ['name', 'medicalSpecialty', 'address'] },
  { type: 'Event', icon: Calendar, description: 'For events and webinars', fields: ['name', 'startDate', 'location'] },
];

export function SchemaGenerator() {
  const { selectedBrand } = useBrandStore();
  const [selectedType, setSelectedType] = useState<SchemaType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);
  const [generatedSchema, setGeneratedSchema] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!selectedType) return;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': selectedType,
    };

    if (selectedType === 'FAQPage') {
      schema.mainEntity = faqs.filter(f => f.question && f.answer).map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }));
    } else {
      Object.entries(formData).forEach(([key, value]) => {
        if (value) schema[key] = value;
      });

      // Add brand info if available
      if (selectedBrand) {
        if (!schema.name) schema.name = selectedBrand.name;
        if (!schema.url) schema.url = selectedBrand.website;
      }
    }

    setGeneratedSchema(JSON.stringify(schema, null, 2));
  };

  const handleCopy = async () => {
    if (!generatedSchema) return;
    await navigator.clipboard.writeText(`<script type="application/ld+json">\n${generatedSchema}\n</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderForm = () => {
    if (!selectedType) return null;

    if (selectedType === 'FAQPage') {
      return (
        <div className="space-y-4">
          <label className="text-sm font-medium">Questions & Answers</label>
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 bg-slate-900/30 rounded-lg space-y-3">
              <input
                type="text"
                value={faq.question}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[index].question = e.target.value;
                  setFaqs(updated);
                }}
                placeholder="Question"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[index].answer = e.target.value;
                  setFaqs(updated);
                }}
                placeholder="Answer"
                rows={2}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
              />
            </div>
          ))}
          <button
            onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            + Add Question
          </button>
        </div>
      );
    }

    const typeConfig = schemaTypes.find(t => t.type === selectedType);
    if (!typeConfig) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {typeConfig.fields.map(field => (
          <div key={field}>
            <label htmlFor={`field-${field}`} className="block text-sm font-medium text-cyan-400 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={`field-${field}`}
              type="text"
              value={formData[field] || ''}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              placeholder={`Enter ${field}`}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-400" />
          Select Schema Type
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {schemaTypes.map((schema) => {
            const Icon = schema.icon;
            return (
              <motion.button
                key={schema.type}
                onClick={() => {
                  setSelectedType(schema.type);
                  setFormData({});
                  setGeneratedSchema(null);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  p-4 rounded-lg border text-left transition-all
                  ${selectedType === schema.type
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }
                `}
              >
                <Icon className={`w-6 h-6 mb-2 ${selectedType === schema.type ? 'text-purple-400' : 'text-slate-400'}`} />
                <p className="font-medium text-sm">{schema.type}</p>
                <p className="text-xs text-muted-foreground mt-1">{schema.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="font-semibold mb-4">{selectedType} Details</h3>
          {renderForm()}

          <motion.button
            onClick={handleGenerate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full py-3 px-6 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25"
          >
            Generate Schema
          </motion.button>
        </motion.div>
      )}

      {/* Generated Schema */}
      {generatedSchema && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Generated JSON-LD</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto text-sm">
            <code className="text-green-400">{`<script type="application/ld+json">`}</code>
            <code className="text-slate-300">{`\n${generatedSchema}\n`}</code>
            <code className="text-green-400">{`</script>`}</code>
          </pre>

          <p className="mt-4 text-sm text-muted-foreground">
            Copy this code and paste it in the <code className="text-purple-400">&lt;head&gt;</code> section of your HTML.
          </p>
        </motion.div>
      )}
    </div>
  );
}
