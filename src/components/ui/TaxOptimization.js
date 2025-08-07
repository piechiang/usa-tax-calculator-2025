import React from 'react';
import { TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';

const TaxOptimization = ({ suggestions, language, t }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {language === 'zh' ? '税务优化建议' : language === 'es' ? 'Sugerencias de Optimización Fiscal' : 'Tax Optimization Suggestions'}
        </h3>
        <div className="text-center text-gray-500 py-4">
          <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p>{language === 'zh' ? '暂无优化建议' : language === 'es' ? 'No hay sugerencias disponibles' : 'No optimization suggestions available'}</p>
        </div>
      </div>
    );
  }

  const getTitle = (suggestion) => {
    if (language === 'zh') return suggestion.title;
    if (language === 'es') return suggestion.titleEs;
    return suggestion.titleEn;
  };

  const getDescription = (suggestion) => {
    if (language === 'zh') return suggestion.description;
    if (language === 'es') return suggestion.descriptionEs;
    return suggestion.descriptionEn;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    const texts = {
      high: { zh: '高优先级', en: 'High Priority', es: 'Alta Prioridad' },
      medium: { zh: '中优先级', en: 'Medium Priority', es: 'Prioridad Media' },
      low: { zh: '低优先级', en: 'Low Priority', es: 'Baja Prioridad' }
    };
    
    if (language === 'zh') return texts[priority]?.zh || texts.medium.zh;
    if (language === 'es') return texts[priority]?.es || texts.medium.es;
    return texts[priority]?.en || texts.medium.en;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        {language === 'zh' ? '税务优化建议' : language === 'es' ? 'Sugerencias de Optimización Fiscal' : 'Tax Optimization Suggestions'}
      </h3>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{suggestion.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">
                    {getTitle(suggestion)}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                    {getPriorityText(suggestion.priority)}
                  </span>
                </div>
                
                <p className="text-sm mb-3">
                  {getDescription(suggestion)}
                </p>
                
                {suggestion.savings > 0 && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">
                        {language === 'zh' ? '节省' : language === 'es' ? 'Ahorro' : 'Savings'}: ${suggestion.savings.toLocaleString()}
                      </span>
                    </div>
                    
                    {suggestion.netCost && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">
                          {language === 'zh' ? '实际成本' : language === 'es' ? 'Costo Real' : 'Net Cost'}: ${suggestion.netCost.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            {language === 'zh' 
              ? '以上建议仅供参考，具体实施前请咨询专业税务顾问。实际节税效果可能因个人情况而异。'
              : language === 'es'
              ? 'Las sugerencias anteriores son solo para referencia. Consulte a un asesor fiscal profesional antes de la implementación. Los ahorros fiscales reales pueden variar según las circunstancias individuales.'
              : 'The above suggestions are for reference only. Please consult a professional tax advisor before implementation. Actual tax savings may vary based on individual circumstances.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxOptimization;