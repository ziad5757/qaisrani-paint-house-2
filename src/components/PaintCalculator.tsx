import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Home, Sun } from 'lucide-react';

interface AreaItem {
  id: string;
  name: string;
  category: 'interior' | 'exterior';
  paintType: 'distemper' | 'water_matt' | 'weather_shield';
  length: number;
  width: number;
  height: number;
  doors: number;
  windows: number;
  isSingleWall?: boolean;
}

export default function PaintCalculator() {
  const [areas, setAreas] = useState<AreaItem[]>([
    {
      id: '1',
      name: 'Bed Room 1',
      category: 'interior',
      paintType: 'water_matt',
      length: 14,
      width: 12,
      height: 10,
      doors: 1,
      windows: 1,
      isSingleWall: false,
    },
    {
      id: '2',
      name: 'Main Exterior Front Wall',
      category: 'exterior',
      paintType: 'weather_shield',
      length: 35,
      width: 0,
      height: 11,
      doors: 1,
      windows: 2,
      isSingleWall: true,
    },
    {
      id: '3',
      name: 'Chat ki Deewar (Parapet)',
      category: 'exterior',
      paintType: 'weather_shield',
      length: 120,
      width: 0,
      height: 3.5,
      doors: 0,
      windows: 0,
      isSingleWall: true,
    }
  ]);

  const calculateNetArea = (item: AreaItem) => {
    let grossArea = 0;
    if (item.isSingleWall) {
      grossArea = item.length * item.height;
    } else {
      grossArea = 2 * (item.length + item.width) * item.height;
    }

    const deductions = (item.doors * 21) + (item.windows * 16);
    return Math.max(0, grossArea - deductions);
  };

  const addArea = (category: 'interior' | 'exterior') => {
    const newItem: AreaItem = {
      id: Date.now().toString(),
      name: category === 'interior' ? `Room / Hall ${areas.length + 1}` : `Exterior / Wall ${areas.length + 1}`,
      category: category,
      paintType: category === 'interior' ? 'water_matt' : 'weather_shield',
      length: 12,
      width: category === 'interior' ? 12 : 0,
      height: 10,
      doors: 0,
      windows: 0,
      isSingleWall: category === 'exterior',
    };
    setAreas([...areas, newItem]);
  };

  const removeArea = (id: string) => {
    setAreas(areas.filter(a => a.id !== id));
  };

  const updateArea = (id: string, field: keyof AreaItem, value: any) => {
    setAreas(areas.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  let totalInteriorSqFt = 0;
  let totalExteriorSqFt = 0;

  areas.forEach(a => {
    const sqFt = calculateNetArea(a);
    if (a.category === 'interior') totalInteriorSqFt += sqFt;
    else totalExteriorSqFt += sqFt;
  });

  const interiorGallons = Math.ceil(totalInteriorSqFt / 135);
  const exteriorGallons = Math.ceil(totalExteriorSqFt / 115);

  const getDrumsAndGallons = (totalGallons: number) => {
    const drums = Math.floor(totalGallons / 4);
    const gallons = totalGallons % 4;
    return { drums, gallons };
  };

  const interiorPacks = getDrumsAndGallons(interiorGallons);
  const exteriorPacks = getDrumsAndGallons(exteriorGallons);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-3 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl shrink-0">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold leading-tight">Paint Calculator</h1>
            <p className="text-white/70 text-xs sm:text-sm">Deewaron, rooms aur chat ke liye exact paint calculate karein</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Interior */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 shrink-0" />
              <h2 className="font-bold text-blue-900 text-sm sm:text-base">Andar Ka Paint</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
              Distemper/Matt
            </span>
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
            <p className="flex justify-between">
              <span>Kul Area:</span>
              <strong className="text-blue-900">{totalInteriorSqFt.toLocaleString()} Sq. Ft.</strong>
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500">Paint Requirement (2 Coats):</p>
                <p className="text-base sm:text-lg font-bold text-blue-800 leading-tight">
                  {interiorPacks.drums > 0 && `${interiorPacks.drums} Drum `}
                  {interiorPacks.gallons > 0 && `${interiorPacks.gallons} Gallon`}
                  {interiorGallons === 0 && '0 Gallon'}
                </p>
              </div>
              <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">~{interiorGallons} Gal</span>
            </div>
          </div>
        </div>

        {/* Exterior */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 shrink-0" />
              <h2 className="font-bold text-amber-900 text-sm sm:text-base">Bahir Ka Paint</h2>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
              Weather Shield
            </span>
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm text-gray-700">
            <p className="flex justify-between">
              <span>Kul Area:</span>
              <strong className="text-amber-900">{totalExteriorSqFt.toLocaleString()} Sq. Ft.</strong>
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500">Paint Requirement (2 Coats):</p>
                <p className="text-base sm:text-lg font-bold text-amber-800 leading-tight">
                  {exteriorPacks.drums > 0 && `${exteriorPacks.drums} Drum `}
                  {exteriorPacks.gallons > 0 && `${exteriorPacks.gallons} Gallon`}
                  {exteriorGallons === 0 && '0 Gallon'}
                </p>
              </div>
              <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md">~{exteriorGallons} Gal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => addArea('interior')}
          className="w-full bg-blue-600 text-white px-3 py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> + Add Interior Room / Hall
        </button>
        <button
          onClick={() => addArea('exterior')}
          className="w-full bg-amber-600 text-white px-3 py-2.5 rounded-xl hover:bg-amber-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> + Add Exterior Wall / Chat
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Ghar Ke Hissey (Area List)</h3>

        {areas.map((item) => {
          const netSqFt = calculateNetArea(item);
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => updateArea(item.id, 'name', e.target.value)}
                  className="font-bold text-gray-800 text-sm sm:text-base border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                />
                <button onClick={() => removeArea(item.id)} className="text-red-500 hover:text-red-700 p-1 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Category selector */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  item.category === 'interior' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.category === 'interior' ? 'Interior' : 'Exterior'}
                </span>
                <select
                  value={item.isSingleWall ? 'wall' : 'room'}
                  onChange={e => updateArea(item.id, 'isSingleWall', e.target.value === 'wall')}
                  className="border border-gray-200 rounded-lg p-1 text-[11px] font-medium bg-gray-50 focus:outline-none"
                >
                  <option value="room">Full Room (4 Walls)</option>
                  <option value="wall">Single Wall / Boundary</option>
                </select>
              </div>

              {/* Dimensions Input */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-gray-500 block mb-1 text-[10px]">
                    {item.isSingleWall ? 'Length (Ft)' : 'Room Length (Ft)'}
                  </label>
                  <input
                    type="number"
                    value={item.length || ''}
                    onChange={e => updateArea(item.id, 'length', Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-blue-300 text-center"
                  />
                </div>

                {!item.isSingleWall && (
                  <div>
                    <label className="text-gray-500 block mb-1 text-[10px]">Room Width (Ft)</label>
                    <input
                      type="number"
                      value={item.width || ''}
                      onChange={e => updateArea(item.id, 'width', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-blue-300 text-center"
                    />
                  </div>
                )}

                <div>
                  <label className="text-gray-500 block mb-1 text-[10px]">Height (Ft)</label>
                  <input
                    type="number"
                    value={item.height || ''}
                    onChange={e => updateArea(item.id, 'height', Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-blue-300 text-center"
                  />
                </div>
              </div>

              {/* Deductions & Result */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 items-center">
                <div>
                  <label className="text-gray-500 block mb-0.5 text-[10px]">Darwaze (Doors)</label>
                  <input
                    type="number"
                    value={item.doors}
                    onChange={e => updateArea(item.id, 'doors', Number(e.target.value))}
                    className="w-full border border-gray-200 bg-white rounded-lg p-1 text-xs text-center font-semibold"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-0.5 text-[10px]">Khidkiyan (Windows)</label>
                  <input
                    type="number"
                    value={item.windows}
                    onChange={e => updateArea(item.id, 'windows', Number(e.target.value))}
                    className="w-full border border-gray-200 bg-white rounded-lg p-1 text-xs text-center font-semibold"
                    min="0"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-1 pt-1 sm:pt-0">
                  <span className="text-gray-500 text-[11px]">Net Area:</span>
                  <span className="font-bold text-gray-800 text-xs sm:text-sm">{netSqFt} Sq Ft</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
