import { motion } from 'framer-motion';
import { Target, FileText, Users, HelpCircle, Brain, Quote, AlertCircle } from 'lucide-react';
import { GeoAnalysis } from '../../types/geo';
import { ScoreGauge } from '../ui/ScoreGauge';

interface GeoDashboardProps {
  analysis: GeoAnalysis | null;
}

export function GeoDashboard({ analysis }: GeoDashboardProps) {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">No Analysis Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Run a GEO analysis first to see your dashboard with scores and insights.
        </p>
      </div>
    );
  }

  const scoreCards = [
    { label: 'Overall Score', score: analysis.scores.overall, icon: Target, color: 'cyan' as const },
    { label: 'Content Depth', score: analysis.scores.contentDepth, icon: FileText, color: 'purple' as const },
    { label: 'Entity Coverage', score: analysis.scores.entityCoverage, icon: Users, color: 'pink' as const },
    { label: 'Q&A Quality', score: analysis.scores.questionAnswer, icon: HelpCircle, color: 'orange' as const },
    { label: 'Semantic Richness', score: analysis.scores.semanticRichness, icon: Brain, color: 'auto' as const },
    { label: 'Citation Potential', score: analysis.scores.citationPotential, icon: Quote, color: 'auto' as const },
  ];

  return (
    <div className="space-y-8">
      {/* URL Banner */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-sm text-muted-foreground">Analyzing:</p>
        <p className="font-medium text-cyan-400">{analysis.url}</p>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {scoreCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex justify-center mb-2">
                <Icon className="w-5 h-5 text-slate-400" />
              </div>
              <ScoreGauge score={card.score} label={card.label} size="sm" color={card.color} />
            </motion.div>
          );
        })}
      </div>

      {/* Entities Section */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Entities Found ({analysis.entities.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.entities.map((entity, i) => (
            <span
              key={i}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                entity.type === 'organization' ? 'bg-purple-500/20 text-purple-400' :
                entity.type === 'person' ? 'bg-blue-500/20 text-blue-400' :
                entity.type === 'product' ? 'bg-green-500/20 text-green-400' :
                entity.type === 'location' ? 'bg-orange-500/20 text-orange-400' :
                'bg-slate-500/20 text-slate-400'
              }`}
            >
              {entity.name}
              <span className="ml-1 opacity-60">x{entity.frequency}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          Questions Answered
        </h3>
        <div className="space-y-3">
          {analysis.questionsAnswered.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                q.answerQuality === 'excellent' ? 'bg-green-500/20 text-green-400' :
                q.answerQuality === 'good' ? 'bg-blue-500/20 text-blue-400' :
                q.answerQuality === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {q.answerQuality}
              </span>
              <div>
                <p className="font-medium">{q.question}</p>
                <p className="text-sm text-muted-foreground">{q.sourceSection}</p>
                {q.improvement && (
                  <p className="text-sm text-orange-400 mt-1">Tip: {q.improvement}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Gaps */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Content Gaps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.contentGaps.map((gap, i) => (
            <div key={i} className={`p-4 rounded-lg border-l-4 ${
              gap.importance === 'critical' ? 'bg-red-500/10 border-red-500' :
              gap.importance === 'high' ? 'bg-orange-500/10 border-orange-500' :
              gap.importance === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
              'bg-slate-500/10 border-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{gap.topic}</h4>
                <span className="text-xs text-muted-foreground">
                  {gap.competitorsCovering} competitors covering
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{gap.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
