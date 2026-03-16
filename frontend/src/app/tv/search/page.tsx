'use client';

import { useState, useEffect, useCallback } from 'react';
import { TVLeanbackList } from '@/components/tv/TVLeanbackList';
import { useTVNavigation } from '@/lib/tv/navigation';

interface Task {
  id: string;
  title: string;
  listName?: string;
}

const TV_KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫', '␣'],
];

export default function TVSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [keyboardFocus, setKeyboardFocus] = useState(0);
  const [mode, setMode] = useState<'keyboard' | 'results'>('keyboard');
  const [resultFocus, setResultFocus] = useState(0);

  const flatKeys = TV_KEYBOARD.flat();
  const { handleKeyDown: handleKbKeyDown } = useTVNavigation(
    flatKeys.length, keyboardFocus, setKeyboardFocus,
    (idx) => {
      const key = flatKeys[idx];
      if (key === '⌫') setQuery((q) => q.slice(0, -1));
      else if (key === '␣') setQuery((q) => q + ' ');
      else setQuery((q) => q + key);
    }
  );

  return (
    <div className="px-12 py-8">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-white/50 text-2xl">🔍</span>
        <div className="flex-1 bg-white/10 rounded-xl px-6 py-4 text-2xl font-mono min-h-[60px] flex items-center">
          {query || <span className="text-white/30">Search tasks...</span>}
          <span className="animate-pulse ml-1 text-indigo-400">|</span>
        </div>
      </div>

      {results.length > 0 && mode === 'results' && (
        <TVLeanbackList
          items={results}
          focusedIndex={resultFocus}
          onFocusChange={setResultFocus}
          onBack={() => setMode('keyboard')}
          renderItem={(task, focused) => (
            <div className={`px-8 py-5 rounded-xl mb-2 ${focused ? 'bg-indigo-600' : 'bg-white/5'}`}>
              <p className="text-xl">{task.title}</p>
              {task.listName && <p className="text-sm text-white/50 mt-1">{task.listName}</p>}
            </div>
          )}
        />
      )}

      <div
        className={`mt-8 ${mode === 'keyboard' ? '' : 'opacity-50'}`}
        onKeyDown={handleKbKeyDown as React.KeyboardEventHandler<HTMLDivElement>}
        tabIndex={mode === 'keyboard' ? 0 : -1}
      >
        {TV_KEYBOARD.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-2 mb-2">
            {row.map((key) => {
              const flatIdx = TV_KEYBOARD.slice(0, rowIdx).flat().length + row.indexOf(key);
              return (
                <button
                  key={key}
                  className={`w-14 h-14 rounded-xl text-lg font-medium transition-all ${
                    flatIdx === keyboardFocus && mode === 'keyboard'
                      ? 'bg-indigo-600 scale-110'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
