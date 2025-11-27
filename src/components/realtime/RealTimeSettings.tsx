import React, { useState } from 'react';
import { Settings, Zap, Clock, BarChart3, RefreshCw, Pause, Play, Info } from 'lucide-react';

interface TaxResult {
  [key: string]: unknown;
}

interface RealTimeSettingsProps {
  realTimeState: {
    isCalculating: boolean;
    lastCalculated: Date | null;
    previousTaxResult: TaxResult | null;
    calculationCount: number;
    averageCalculationTime: number;
    realTimeEnabled: boolean;
    debounceDelay: number;
  };
  onToggleRealTime: () => void;
  onSetDebounceDelay: (delay: number) => void;
  onForceCalculation: () => void;
  onResetMetrics: () => void;
  t: (key: string) => string;
}

export const RealTimeSettings: React.FC<RealTimeSettingsProps> = ({
  realTimeState,
  onToggleRealTime,
  onSetDebounceDelay,
  onForceCalculation,
  onResetMetrics,
  t: _t
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempDebounceDelay, setTempDebounceDelay] = useState(realTimeState.debounceDelay);

  const handleDebounceChange = (value: number) => {
    setTempDebounceDelay(value);
    onSetDebounceDelay(value);
  };

  const getPerformanceColor = (avgTime: number) => {
    if (avgTime < 100) return 'text-green-600';
    if (avgTime < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (avgTime: number) => {
    if (avgTime < 100) return '🚀';
    if (avgTime < 300) return '⚡';
    return '🐌';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Calculator Settings</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {showAdvanced ? 'Simple View' : 'Advanced'}
        </button>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Real-Time Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {realTimeState.realTimeEnabled ? (
              <Play className="h-4 w-4 text-green-600" />
            ) : (
              <Pause className="h-4 w-4 text-gray-600" />
            )}
            <span className="font-medium text-gray-900">Real-Time Updates</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={realTimeState.realTimeEnabled}
              onChange={onToggleRealTime}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full ${
              realTimeState.realTimeEnabled ? 'bg-green-600' : 'bg-gray-300'
            }`}>
              <div className={`dot absolute w-4 h-4 rounded-full bg-white transition transform ${
                realTimeState.realTimeEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} style={{ top: '4px' }}></div>
            </div>
          </label>
        </div>

        {/* Manual Calculate */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900">Manual Calculate</span>
          </div>
          <button
            onClick={onForceCalculation}
            disabled={realTimeState.isCalculating}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {realTimeState.isCalculating ? 'Calculating...' : 'Calculate Now'}
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Calculations</span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            {realTimeState.calculationCount}
          </div>
          <div className="text-xs text-blue-700">Total performed</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Avg Speed</span>
          </div>
          <div className={`text-lg font-bold ${getPerformanceColor(realTimeState.averageCalculationTime)}`}>
            {realTimeState.averageCalculationTime.toFixed(0)}ms
          </div>
          <div className="text-xs text-yellow-700 flex items-center gap-1">
            <span>{getPerformanceIcon(realTimeState.averageCalculationTime)}</span>
            Performance
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Last Updated</span>
          </div>
          <div className="text-lg font-bold text-green-900">
            {realTimeState.lastCalculated
              ? realTimeState.lastCalculated.toLocaleTimeString()
              : 'Never'
            }
          </div>
          <div className="text-xs text-green-700">
            {realTimeState.isCalculating ? 'Calculating...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Settings</h4>

          {/* Debounce Delay */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calculation Delay (Debounce): {tempDebounceDelay}ms
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Fast</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={tempDebounceDelay}
                onChange={(e) => handleDebounceChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500">Slow</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More responsive</span>
              <span>Less CPU usage</span>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Performance Tips</span>
            </div>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Lower debounce delay = more responsive but higher CPU usage</li>
              <li>• Disable real-time for complex scenarios to improve performance</li>
              <li>• Use manual calculation for final review before filing</li>
              <li>• Average calculation time under 300ms is considered good</li>
            </ul>
          </div>

          {/* Reset Metrics */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Reset performance metrics</span>
            <button
              onClick={onResetMetrics}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
          realTimeState.realTimeEnabled
            ? realTimeState.isCalculating
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            realTimeState.realTimeEnabled
              ? realTimeState.isCalculating
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-green-400'
              : 'bg-gray-400'
          }`}></div>
          <span>
            {realTimeState.realTimeEnabled
              ? realTimeState.isCalculating
                ? 'Calculating in real-time...'
                : 'Real-time calculations active'
              : 'Real-time calculations disabled'
            }
          </span>
        </div>
      </div>
    </div>
  );
};